import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateHadiahDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  namaHadiah?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  poinDibutuhkan?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stok?: number;
}