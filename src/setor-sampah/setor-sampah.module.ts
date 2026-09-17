import { Module } from '@nestjs/common';

import { SetorSampahController } from './setor-sampah.controller.js';
import { SetorSampahService } from './setor-sampah.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SetorSampahController],
  providers: [SetorSampahService],
})
export class SetorSampahModule {}