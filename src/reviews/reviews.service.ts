import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { ReviewResponse } from 'src/utils/types';
import { UpdateReviewDto } from './dtos/update-review.dto';

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
   * Creates a new review for a product.
   * @param dto - The data for creating the review.
   * @param userId - The ID of the user creating the review.
   * @param productId - The ID of the product being reviewed.
   * @returns A promise resolving to the created review.
   */
  async create(
    dto: CreateReviewDto,
    userId: number,
    productId: number,
  ): Promise<ReviewResponse> {
    // 1. Check if product exists
    const product = await this.productsService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');

    // 2. Check if user exists
    const user = await this.usersService.getCurrentUser(userId);
    if (!user) throw new NotFoundException('User not found');

    // 3. Create review entity
    const newReview = this.reviewRepository.create({
      ...dto,
      product,
      user,
    });

    // 4. Save to database
    const savedReview = await this.reviewRepository.save(newReview);

    // 5. Return only needed fields (avoid nested product/user)
    return {
      id: savedReview.id,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt, // if you have timestamps
      updatedAt: savedReview.updatedAt,
      product: {
        id: savedReview.product.id,
        title: savedReview.product.title,
      }, // or just productId if you prefer
      user: {
        id: savedReview.user.id,
        username: savedReview.user.username,
      },
    };
  }

  /**
   * Get a single review by its ID.
   * @param id  - The ID of the review to retrieve.
   * @returns  A promise resolving to the review details.
   */
  async getOne(id: number): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'], // to get product and user details
    });
    if (!review) throw new NotFoundException('Review not found');
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt, // if you have timestamps
      updatedAt: review.updatedAt,
      product: {
        id: review.product.id,
        title: review.product.title,
      }, // or just productId if you prefer
      user: {
        id: review.user.id,
        username: review.user.username,
      },
    };
  }

  // update
  async update(id: number, dto: UpdateReviewDto): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['product', 'user'], // to get product and user details
    });
    if (!review) throw new NotFoundException('Review not found');
    // Update the review with the new data
    Object.assign(review, dto);
    // Save the updated review
    const updatedReview = await this.reviewRepository.save(review);
    // Return the updated review
    return {
      id: updatedReview.id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt,
      product: {
        id: updatedReview.product.id,
        title: updatedReview.product.title,
      },
      user: {
        id: updatedReview.user.id,
        username: updatedReview.user.username,
      },
    };
  }

  async delete(id: number): Promise<string> {
    await this.reviewRepository.delete(id);
    return `Review with ID ${id} deleted successfully`;
  }

  async getByProductId(productId: number): Promise<ReviewResponse[]> {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['product', 'user'], // to get product and user details
    });
    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt, // if you have timestamps
      updatedAt: review.updatedAt,
      product: {
        id: review.product.id,
        title: review.product.title,
      }, // or just productId if you prefer
      user: {
        id: review.user.id,
        username: review.user.username,
      },
    }));
  }

  async getAll(): Promise<ReviewResponse[]> {
    const reviews = await this.reviewRepository.find({
      order: { createdAt: 'DESC' }, // Optional: order by creation date
      relations: ['product', 'user'], // to get product and user details
    });
    return reviews;
  }
}
