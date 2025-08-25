import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CalcService } from '../calc/calc.service';
import {
    BadGatewayException,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client'; // para tipificar errores Prisma

@Injectable()
export class CertificadosService {
    constructor(private db: PrismaService, private calc: CalcService) { }

    list() {
        return this.db.formatoCalibracion.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: { equipo: { include: { cliente: true } }, metrologo: true }
        });
    }

    async create(dto: {
        encabezado: { equipoId: string; metrologoId: string; fecha: string; lugar: string };
        hr?: { puntos: any[]; version?: string };
        temp?: { puntos: any[]; version?: string };
    }) {
        try {
            // (Opcional pero recomendado) Pre‑validar FKs para dar 404/400 en vez de P2003
            const [equipo, metrologo] = await Promise.all([
                this.db.equipo.findUnique({ where: { id: dto.encabezado.equipoId }, select: { id: true } }),
                this.db.user.findUnique({ where: { id: dto.encabezado.metrologoId }, select: { id: true, role: true } }),
            ]);
            if (!equipo) throw new NotFoundException('equipoId no existe');
            if (!metrologo) throw new NotFoundException('metrologoId no existe');

            // Normaliza fecha: si es inválida, corta con 400 controlado
            const fecha = new Date(dto.encabezado.fecha);
            if (isNaN(fecha.getTime())) {
                throw new BadRequestException('Fecha inválida: usa ISO 8601 (new Date().toISOString())');
            }

            const entradas = { hr: dto.hr ?? null, temp: dto.temp ?? null };

            const cert = await this.db.formatoCalibracion.create({
                data: {
                    equipoId: dto.encabezado.equipoId,
                    metrologoId: dto.encabezado.metrologoId,
                    fecha,
                    lugar: dto.encabezado.lugar,
                    entradasJSON: JSON.stringify(entradas),
                    resultadosJSON: JSON.stringify({}),
                    estado: 'EN_PROCESO',
                },
            });

            // Llamada al microservicio de cálculo
            const resHR = entradas.hr ? await this.calc.calcularHR(entradas.hr) : null;
            const resultados = { hr: resHR, engineVersion: 'v1.0.0' };

            await this.db.formatoCalibracion.update({
                where: { id: cert.id },
                data: { resultadosJSON: JSON.stringify(resultados), estado: 'EMITIDO' },
            });

            return this.db.formatoCalibracion.findUnique({
                where: { id: cert.id },
                include: { equipo: { include: { cliente: true } }, metrologo: true },
            });
        } catch (err: any) {
            // Axios (FastAPI) => 502
            if (err?.isAxiosError) {
                // Log detallado para depurar rápido en consola
                console.error('Calc error:', {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw new BadGatewayException('Fallo el servicio de cálculo');
            }

            // Prisma: FK / validación
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2003') {
                    // Foreign key constraint failed
                    throw new BadRequestException('IDs inválidos (violación de FK)');
                }
                if (err.code === 'P2002') {
                    // Unique constraint
                    throw new BadRequestException('Violación de unicidad');
                }
            }

            // Errores de validación propios
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }

            // Fallback genérico
            console.error('Create certificado failed:', err);
            throw new InternalServerErrorException();
        }
    }
}