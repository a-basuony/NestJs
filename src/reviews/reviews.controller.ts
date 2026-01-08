import { Controller, Get } from '@nestjs/common';

@Controller()
export class ReviewsController {
  // GET : ~/api/reviews
  @Get('/api/reviews')
  public getReviews() {
    return [
      { id: 1, content: 'Great product!', rating: 5 },
      { id: 2, content: 'Not bad', rating: 3 },
      { id: 3, content: 'Would not recommend', rating: 1 },
    ];
  }
}
