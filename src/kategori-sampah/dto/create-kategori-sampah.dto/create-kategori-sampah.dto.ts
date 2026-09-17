import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum JenisSampah {
  plastik = 'plastik',
  kertas = 'kertas',
  logam = 'logam',
  kaca = 'kaca',
}

export class CreateKategoriSampahDto {
  @IsString()
  @IsNotEmpty()
  namaKategori: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  hargaPerKg: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  poinPerKg: number;

  @IsEnum(JenisSampah)
  jenis: JenisSampah;
}