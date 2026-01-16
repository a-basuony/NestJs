import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register new user
   * POST /auth/register
   */
  @Post('/auth/register')
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }
}
