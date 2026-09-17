import { Module } from '@nestjs/common';

import { PenukaranPoinController } from './penukaran-poin.controller.js';
import { PenukaranPoinService } from './penukaran-poin.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PenukaranPoinController],
  providers: [PenukaranPoinService],
})
export class PenukaranPoinModule {}