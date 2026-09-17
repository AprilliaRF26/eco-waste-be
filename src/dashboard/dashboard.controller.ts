import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Menampilkan ringkasan dashboard',
    description:
      'Admin melihat ringkasan data sistem bank sampah.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ringkasan dashboard berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Menampilkan statistik dashboard',
    description:
      'Admin melihat statistik data nasabah, setor sampah, poin, dan penukaran.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistik dashboard berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  async getStats() {
    return this.dashboardService.getStats();
  }
}