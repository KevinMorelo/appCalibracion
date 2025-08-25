import { Body, Controller, Get, Post } from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { ValidationPipe } from '@nestjs/common';
import { CreateCertDto } from './create-cert.dto';

@Controller('certificados')
export class CertificadosController {
  constructor(private svc: CertificadosService) {}

  @Get()
  list() { return this.svc.list(); }

@Post()
create(@Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateCertDto) {
  return this.svc.create(dto);
 }
}
