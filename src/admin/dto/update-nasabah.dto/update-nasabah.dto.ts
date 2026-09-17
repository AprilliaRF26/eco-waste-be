import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateNasabahDto {
  @IsOptional()
  @IsString()
  namaNasabah?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  telp?: string;

  @IsOptional()
  @IsDateString()
  tanggalLahir?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}