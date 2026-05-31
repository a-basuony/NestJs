import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { UpdateReviewDto } from './dtos/update-review.dto';

@Controller('/api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

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

  @Get()
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  public getAllReviews(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reviewsService.findAll(page, limit);
  }

  @Get('product/:productId')
  public getReviewsByProductId(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.getByProductId(productId);
  }

  @Get(':id')
  public getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.USER)
  public updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.update(id, payload, dto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN, UserType.USER)
  public deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.delete(id, payload);
  }
}
