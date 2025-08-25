import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  // En Prisma v6 usa onModuleDestroy para cerrar la conexión limpiamente
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
