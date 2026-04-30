import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
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
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

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
  @UseInterceptors(LoggingInterceptor) // Apply the logging interceptor to this route
  getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    console.log('📌 Inside route handler');
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get('all')
  @Roles(UserType.ADMIN) // Only allow access to users with the ADMIN role
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JWT authentication and role-based access control
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Patch('update')
  @Roles(UserType.ADMIN, UserType.USER) // Allow access to both ADMIN and USER roles
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JWT authentication and role-based access control
  updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(payload.id, body);
  }
  /**
   *  Delete a user by ID. Only the user themselves or an admin can delete the account.
   * @param userId - ID of the user to be deleted
   * @param payload  - JWT payload containing the ID and user type of the requester
   * @returns  A message indicating successful deletion or an error if the user is not found or the requester is not authorized
   */
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.USER) // Allow access to both ADMIN and USER roles
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JW`T authentication and role-based access control
  deleteUser(
    @CurrentUser() payload: JWTPayloadType,
    @Param('id') userId: number,
  ) {
    return this.usersService.deleteUser(userId, payload);
  }
}
