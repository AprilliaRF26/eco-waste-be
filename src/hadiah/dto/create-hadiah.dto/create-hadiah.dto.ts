import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHadiahDto {
  @IsString()
  @IsNotEmpty()
  namaHadiah: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  poinDibutuhkan: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stok: number;
}