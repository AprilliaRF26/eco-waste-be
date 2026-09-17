import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterNasabahBankDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  namaNasabah: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsString()
  @IsNotEmpty()
  telp: string;

  @IsDateString()
  tanggalLahir: string;
}