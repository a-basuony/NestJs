import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ReviewsService } from './../reviews/reviews.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService,
  ) {}
  public getAll() {
    return [
      { id: 1, name: 'ahmed' },
      { id: 2, name: 'youssef' },
      { id: 3, name: 'omar' },
    ];
  }
}
