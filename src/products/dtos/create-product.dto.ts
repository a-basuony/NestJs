import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  // @MinLength(2)
  // @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  title: string;

  @IsString()
  @MinLength(5)
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Price must be at least 0' })
  @Max(1000, { message: 'Price must not exceed 1000' })
  price: number;
}
