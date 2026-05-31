import { IsOptional, Max, Min, MinLength } from 'class-validator';

export class UpdateReviewDto {
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number; // Optional, 1-5 stars
  @IsOptional()
  @MinLength(2)
  comment?: string; // Optional
}
