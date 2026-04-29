import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

/**
 * DTO for updating user information.
 * Both fields are optional because user may update only one field.
 */
export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  @Length(2, 150)
  @IsOptional()
  username?: string;
}
