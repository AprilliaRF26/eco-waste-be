import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class TukarPoinDto {
  @IsString()
  @IsNotEmpty()
  hadiahId: string;
}