import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

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

  /**
   *Login user
   * @param body data for login user account
   * @returns JWT (access token)
   */
  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }
}
