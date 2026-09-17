import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNasabahDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  namaNasabah: string;

  @IsString()
  alamat: string;

  @IsString()
  telp: string;

  @IsOptional()
  @IsDateString()
  tanggalLahir?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}