import { IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  comment: string;
}
