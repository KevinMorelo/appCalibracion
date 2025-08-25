import { Module } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';
import { PrismaService } from '../prisma.service';
import { CalcModule } from '../calc/calc.module';

@Module({
  imports: [CalcModule],
  providers: [PrismaService, CertificadosService],
  controllers: [CertificadosController],
})
export class CertificadosModule {}
