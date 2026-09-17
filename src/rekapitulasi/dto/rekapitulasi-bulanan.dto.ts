import { IsDateString } from 'class-validator';

export class RekapitulasiBulananDto {
  @IsDateString()
  bulan: string;
}