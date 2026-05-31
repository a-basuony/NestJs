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
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // 1-5 stars

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  comment: string;
}
