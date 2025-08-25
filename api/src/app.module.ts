import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { CertificadosModule } from './certificados/certificados.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CertificadosModule],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
