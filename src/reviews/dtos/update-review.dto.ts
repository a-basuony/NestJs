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
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number; // Optional, 1-5 stars

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  comment?: string; // Optional
}
