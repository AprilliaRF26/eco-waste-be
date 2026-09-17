import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAdminBankDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  namaUnit: string;

  @IsString()
  @IsNotEmpty()
  namaPengelola: string;

  @IsString()
  @IsNotEmpty()
  telp: string;
}