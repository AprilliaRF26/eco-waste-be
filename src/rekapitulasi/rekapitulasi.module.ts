import { Module } from '@nestjs/common';

import { RekapitulasiController } from './rekapitulasi.controller.js';
import { RekapitulasiService } from './rekapitulasi.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [RekapitulasiController],
  providers: [RekapitulasiService],
})
export class RekapitulasiModule {}