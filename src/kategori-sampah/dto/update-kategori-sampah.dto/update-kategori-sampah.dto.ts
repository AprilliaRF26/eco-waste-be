import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { JenisSampah } from '../create-kategori-sampah.dto/create-kategori-sampah.dto.js';

export class UpdateKategoriSampahDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  namaKategori?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  hargaPerKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  poinPerKg?: number;

  @IsOptional()
  @IsEnum(JenisSampah)
  jenis?: JenisSampah;
}