import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';
import { AuthProvider } from './auth.provider';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * Create a new user
   *@param RegisterDto - user registration details
   *@return created user object & JWT token (to be implemented)
   */
  public async register(registerDto: RegisterDto): Promise<AccessTokenType> {
    return this.authProvider.register(registerDto);
  }

  /**
   * Login user
   *@param LoginDto - user login details
   *@return user object & JWT token (access token)
   */
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    return this.authProvider.login(loginDto);
  }

  /**
   *  Get current user details
   * @param userId  - ID of the user to retrieve details for
   * @returns  User object containing the details of the requested user
   * @throws BadRequestException if the user with the specified ID is not found
   */
  public async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      // select: ['id', 'email', 'userType', 'createdAt', 'updatedAt'], //use EXclude instead of this Exclude password and other sensitive fields from the query results
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  /**
   *  Get all users
   * This should be accessible only by admin users
   */
  public async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      // select: ['id', 'email', 'userType', 'createdAt', 'updatedAt'], // we use Exclude in the entity to exclude password and other sensitive fields from the query results
    });
    return users;
  }

  /**
   * Update user information (username and/or password).
   * Only authenticated user can update their own data.
   * Password will be hashed before saving.
   * @param userId - id of the user to update
   * @param updateData - DTO with optional username and/or password
   * @returns updated user object
   */
  public async updateUser(
    userId: number,
    updateData: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 2. Update username if provided
    if (updateData.username) {
      user.username = updateData.username;
    }
    // 3. Update password if provided (hash it first)
    if (updateData.password) {
      user.password = await this.authProvider.hashPassword(updateData.password);
    }
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Delete a user by ID.
   * Only an admin OR the user themselves can delete the account.
   * @param userId - ID of the user to be deleted
   * @param payload - JWT payload of the requester (contains id and userType)
   * @returns success message
   * @throws NotFoundException if user doesn't exist
   * @throws ForbiddenException if requester lacks permission
   */
  public async deleteUser(
    userId: number,
    payload: JWTPayloadType,
  ): Promise<{ message: string }> {
    // 1. Fetch the target user from database
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check authorization: requester is admin OR requester is the same user
    const isAdmin = payload.userType === UserType.ADMIN;
    const isSelf = user.id === payload.id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You are not allowed to delete this user');
    }

    // 3. Perform deletion
    await this.userRepository.delete(userId);
    return { message: 'User deleted successfully' };
  }
}
