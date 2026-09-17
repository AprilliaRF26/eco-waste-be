import {
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SeedService } from './seed.service.js';

@ApiTags('Seed')
@Controller('api/v1/seed')
export class SeedController {
  constructor(
    private readonly seedService: SeedService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Menjalankan seed database',
    description:
      'Membuat data awal untuk kebutuhan pengujian aplikasi Eco Waste Management.',
  })
  @ApiResponse({
    status: 201,
    description: 'Seed database berhasil dijalankan',
  })
  @ApiResponse({
    status: 400,
    description: 'Seed gagal dijalankan',
  })
  async seed() {
    return this.seedService.seed();
  }
}