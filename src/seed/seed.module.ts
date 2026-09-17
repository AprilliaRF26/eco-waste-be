import { Module } from '@nestjs/common';

import { SeedController } from './seed.controller.js';
import { SeedService } from './seed.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}