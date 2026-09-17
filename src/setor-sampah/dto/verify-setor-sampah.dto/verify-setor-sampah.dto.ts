import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export enum VerifySetorStatus {
  diverifikasi = 'diverifikasi',
  ditolak = 'ditolak',
}

export class VerifyItemRealDto {
  @IsString()
  id: string;

  @IsString()
  kategoriSampahId: string;

  @IsNumber()
  @Min(0)
  beratKgReal: number;
}

export class VerifySetorSampahDto {
  @IsEnum(VerifySetorStatus)
  status: VerifySetorStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VerifyItemRealDto)
  itemsReal?: VerifyItemRealDto[];

  @IsOptional()
  @IsString()
  catatanAdmin?: string;
}