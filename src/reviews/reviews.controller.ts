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

  /**
   * Create a review for a product.
   * POST /api/reviews/:productId
   * @param dto review rating and comment
   * @param productId ID of the product being reviewed
   * @param payload JWT payload for the authenticated user creating the review
   * @returns the created review with product and user summary data
   */
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

  /**
   * Get all reviews with pagination. Admin only.
   * GET /api/reviews?page=1&limit=10
   * @param page page number to read, starting from 1
   * @param limit number of reviews per page
   * @returns list of reviews ordered from newest to oldest
   */
  @Get()
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  public getAllReviews(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reviewsService.findAll(page, limit);
  }

  /**
   * Get reviews for a single product.
   * GET /api/reviews/product/:productId
   * @param productId ID of the product whose reviews should be returned
   * @returns list of product reviews ordered from newest to oldest
   */
  @Get('product/:productId')
  public getReviewsByProductId(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewsService.getByProductId(productId);
  }

  /**
   * Get one review by ID.
   * GET /api/reviews/:id
   * @param id review ID
   * @returns the matching review with product and user summary data
   */
  @Get(':id')
  public getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  /**
   * Update the current user's review.
   * PATCH /api/reviews/:id
   * @param id review ID
   * @param dto optional rating and comment updates
   * @param payload JWT payload for the authenticated user
   * @returns the updated review
   */
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

  /**
   * Delete a review. The owner or an admin can delete it.
   * DELETE /api/reviews/:id
   * @param id review ID
   * @param payload JWT payload for the authenticated user
   * @returns success message after deletion
   */
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
