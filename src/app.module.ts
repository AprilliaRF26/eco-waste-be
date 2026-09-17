import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { KategoriSampahModule } from './kategori-sampah/kategori-sampah.module.js';
import { SetorSampahModule } from './setor-sampah/setor-sampah.module.js';
import { HadiahModule } from './hadiah/hadiah.module.js';
import { PenukaranPoinModule } from './penukaran-poin/penukaran-poin.module.js';
import { RekapitulasiModule } from './rekapitulasi/rekapitulasi.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { SeedModule } from './seed/seed.module.js';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, KategoriSampahModule, SetorSampahModule, HadiahModule, PenukaranPoinModule, RekapitulasiModule, DashboardModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}