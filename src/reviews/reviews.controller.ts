import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JWTAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { UserType } from 'src/utils/enums';
import { Roles } from 'src/users/decorators/roles.decorator';
import { CreateReviewDto } from './dtos/create-review.dto';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import type { JWTPayloadType } from 'src/utils/types';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  // GET : ~/api/reviews
  @Get()
  public getAllReviews() {}

  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.USER)
  @Post(':productId')
  public createReview(
    @Body() dto: CreateReviewDto,
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.create(dto, payload.id, productId);
  }

  @Get(':productId')
  public getReviewsByProductId(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.getByProductId(productId);
  }
}
