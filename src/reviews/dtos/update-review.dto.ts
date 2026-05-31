import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateReviewDto {
  /**
   * Updated star rating for the product.
   * Optional, but when provided it must be an integer between 1 and 5.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number; // Optional, 1-5 stars

  /**
   * Updated text feedback for the product.
   * Optional, but when provided it must be between 2 and 1000 characters.
   */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  comment?: string; // Optional
}
