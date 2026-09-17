import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DetailSetorSampahDto {
  @IsString()
  @IsNotEmpty()
  kategoriSampahId: string;

  @IsNumber()
  @Min(0.01)
  beratKg: number;
}

export class CreateSetorSampahDto {
  @IsDateString()
  tanggal: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailSetorSampahDto)
  detail: DetailSetorSampahDto[];

  @IsString()
  catatan?: string;
}