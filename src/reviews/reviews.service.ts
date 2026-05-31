import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JWTPayloadType, ReviewResponse } from 'src/utils/types';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { UserType } from 'src/utils/enums';

@Injectable()
export class ReviewsService {
  constructor(
    // private readonly reviewsRepository: ReviewsRepository,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new review linked to an existing product and authenticated user.
   * @param dto review rating and comment
   * @param userId ID of the authenticated user
   * @param productId ID of the product being reviewed
   * @returns formatted review response
   */
  async create(
    dto: CreateReviewDto,
    userId: number,
    productId: number,
  ): Promise<ReviewResponse> {
    const product = await this.productsService.findOne(productId);
    const user = await this.usersService.getCurrentUser(userId);

    const newReview = this.reviewRepository.create({
      ...dto,
      product,
      user,
    });

    const savedReview = await this.reviewRepository.save(newReview);

    return this.toReviewResponse(savedReview);
  }

  /**
   * Find one review by ID.
   * @param id review ID
   * @returns formatted review response
   * @throws NotFoundException when the review does not exist
   */
  async findOne(id: number): Promise<ReviewResponse> {
    return this.toReviewResponse(await this.findReviewById(id));
  }

  /**
   * Update a review owned by the authenticated user.
   * @param id review ID
   * @param payload JWT payload for the authenticated user
   * @param dto optional rating and comment updates
   * @returns formatted updated review response
   * @throws ForbiddenException when the user does not own the review
   * @throws NotFoundException when the review does not exist
   */
  async update(
    id: number,
    payload: JWTPayloadType,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponse> {
    const review = await this.findReviewById(id);

    if (review.user.id !== payload.id) {
      throw new ForbiddenException('You are not allowed to update this review');
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    return this.toReviewResponse(await this.reviewRepository.save(review));
  }

  /**
   * Delete a review when the requester is the owner or an admin.
   * @param id review ID
   * @param payload JWT payload for the authenticated user
   * @returns success message
   * @throws ForbiddenException when the requester is neither owner nor admin
   * @throws NotFoundException when the review does not exist
   */
  async delete(
    id: number,
    payload: JWTPayloadType,
  ): Promise<{ message: string }> {
    const review = await this.findReviewById(id);
    const isOwner = review.user.id === payload.id;
    const isAdmin = payload.userType === `${UserType.ADMIN}`;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.reviewRepository.remove(review);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get all reviews for a product.
   * @param productId ID of the product whose reviews should be returned
   * @returns formatted reviews ordered from newest to oldest
   * @throws NotFoundException when the product does not exist
   */
  async getByProductId(productId: number): Promise<ReviewResponse[]> {
    await this.productsService.findOne(productId);

    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' }, // desc the last review will be the first one in the list
    });

    return reviews.map((review) => this.toReviewResponse(review));
  }

  /**
   * Get a paginated list of all reviews.
   * @param page page number, starting from 1
   * @param limit number of reviews per page
   * @returns formatted reviews ordered from newest to oldest
   */
  async findAll(page: number, limit: number): Promise<ReviewResponse[]> {
    const skip = (page - 1) * limit;

    const reviews = await this.reviewRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['product', 'user'],
      skip,
      take: limit,
    });

    return reviews.map((review) => this.toReviewResponse(review));
  }

  /**
   * Load a review with product and user relations.
   * @param id review ID
   * @returns review entity with relations
   * @throws NotFoundException when the review does not exist
   */
  private async findReviewById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) throw new NotFoundException('Review not found');

    return review;
  }

  /**
   * Convert a review entity into the public API response shape.
   * @param review review entity with product and user relations loaded
   * @returns review response without exposing full related entities
   */
  private toReviewResponse(review: Review): ReviewResponse {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      product: {
        id: review.product.id,
        title: review.product.title,
      },
      user: {
        id: review.user.id,
        username: review.user.username,
      },
    };
  }
}
