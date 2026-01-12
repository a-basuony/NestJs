import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewsService {

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public getAll() {
    return [
      { id: 1, content: 'Great product!', rating: 5 },
      { id: 2, content: 'Not bad', rating: 3 },
      { id: 3, content: 'Would not recommend', rating: 1 },
    ];
  }
}
