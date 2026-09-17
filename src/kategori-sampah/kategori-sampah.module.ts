import { Module } from '@nestjs/common';

import { KategoriSampahController } from './kategori-sampah.controller.js';
import { KategoriSampahService } from './kategori-sampah.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [KategoriSampahController],
  providers: [KategoriSampahService],
})
export class KategoriSampahModule {}