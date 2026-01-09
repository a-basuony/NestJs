import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 50)
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  @IsOptional()
  price?: number;
}
