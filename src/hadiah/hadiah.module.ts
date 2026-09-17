import { Module } from '@nestjs/common';

import { HadiahController } from './hadiah.controller.js';
import { HadiahService } from './hadiah.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [HadiahController],
  providers: [HadiahService],
})
export class HadiahModule {}