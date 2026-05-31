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

  async findOne(id: number): Promise<ReviewResponse> {
    return this.toReviewResponse(await this.findReviewById(id));
  }

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

  async getByProductId(productId: number): Promise<ReviewResponse[]> {
    await this.productsService.findOne(productId);

    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' }, // desc the last review will be the first one in the list
    });

    return reviews.map((review) => this.toReviewResponse(review));
  }

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

  private async findReviewById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) throw new NotFoundException('Review not found');

    return review;
  }

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
