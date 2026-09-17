import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UpdateStatusPenukaran {
  selesai = 'selesai',
  dibatalkan = 'dibatalkan',
}

export class UpdateStatusPenukaranDto {
  @IsEnum(UpdateStatusPenukaran)
  status: UpdateStatusPenukaran;

  @IsOptional()
  @IsString()
  catatan?: string;
}