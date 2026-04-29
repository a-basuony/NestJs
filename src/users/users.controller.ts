import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JWTPayloadType } from 'src/utils/types';
import { Roles } from './decorators/roles.decorator';
import { UserType } from 'src/utils/enums';
import { RolesGuard } from './guards/roles.guard';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register new user
   * POST /api/users/auth/register
   */
  @Post('auth/register')
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  /**
   *Login user
   * @param body data for login user account
   * @returns JWT (access token)
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK) // Set the response status code to 200 OK for successful login
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  /**
   *  Get current user details
   * GET /api/users/current-user
   * @param payload  JWT payload extracted from the token, containing user information
   * @returns  User object
   */
  @Get('current-user')
  @UseGuards(JWTAuthGuard) // Protect this route with JWT authentication
  getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get('all')
  @Roles(UserType.ADMIN) // Only allow access to users with the ADMIN role
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JWT authentication and role-based access control
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
