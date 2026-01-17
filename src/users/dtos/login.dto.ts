import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(250)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
