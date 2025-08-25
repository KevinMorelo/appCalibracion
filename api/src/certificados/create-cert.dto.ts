// apps/api/src/certificados/dto/create-cert.dto.ts
import { IsArray, IsDateString, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EncabezadoDto {
  @IsString() equipoId: string;
  @IsString() metrologoId: string;
  @IsDateString() fecha: string;
  @IsString() lugar: string;
}

export class PuntoHRDto {
  hrPunto: number;
  lecturasIBC: number[];
  lecturaPatron: number;
  uPatron: number;
  correccionPatron: number;
  resolucionIBC: number;
  dofPatron?: number;
  distribResIBC?: 'RECTANGULAR'|'NORMAL';
}

export class CreateCertDto {
  @ValidateNested() @Type(() => EncabezadoDto) encabezado: EncabezadoDto;
  hr?: { puntos: PuntoHRDto[]; version?: string };
  temp?: { puntos: any[]; version?: string };
}
