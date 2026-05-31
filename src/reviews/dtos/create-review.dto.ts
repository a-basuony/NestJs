import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  /**
   * Star rating for the product.
   * Must be an integer between 1 and 5.
   */
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  /**
   * Text feedback for the product.
   * Must be between 2 and 1000 characters.
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  comment: string;
}
