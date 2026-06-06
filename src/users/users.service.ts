import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';
import { AuthProvider } from './auth.provider';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';

const USER_IMAGES_DIR = path.join(process.cwd(), 'images', 'users');

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

  /**
   * Update the profile image filename for a user.
   * @param userId id of the user
   * @param newProfileImage the new profile image filename saved by Multer
   * @returns the updated user object with the new profile image filename
   * @throws NotFoundException if the user with the specified ID is not found
   */
  public async setProfileImage(
    userId: number,
    newProfileImage: string,
  ): Promise<User> {
    const user = await this.getCurrentUser(userId);

    // Keep only the generated filename in the database.
    // The upload folder can change later without rewriting every user row.
    const oldProfileImage = user.profileImage;
    user.profileImage = newProfileImage;

    // Delete the previous file after the user exists and before saving the new name.
    // If the old file is already missing, the helper quietly ignores that case.
    if (oldProfileImage) {
      await this.deleteProfileImageFile(oldProfileImage);
    }

    return this.userRepository.save(user);
  }

  /**
   * remove the profile image of a user. This will delete the image file from the server and set the profileImage field to null in the database.
   * @param userId  - ID of the user whose profile image is to be removed
   * @returns  the updated user object with profileImage set to null
   */
  public async removeProfileImage(userId: number): Promise<User> {
    const user = await this.getCurrentUser(userId);

    if (!user.profileImage) {
      throw new BadRequestException('User has no profile image');
    }

    // Remove the physical file first, then clear the database value.
    // This keeps the database from pointing to a file we intentionally deleted.
    await this.deleteProfileImageFile(user.profileImage);

    user.profileImage = null;
    return this.userRepository.save(user);
  }

  public async getProfileImagePath(
    userId: number,
    requestedFilename: string,
  ): Promise<string> {
    const user = await this.getCurrentUser(userId);

    // Users can only request the filename stored on their own profile.
    // This prevents someone from guessing another uploaded filename.
    if (!user.profileImage || user.profileImage !== requestedFilename) {
      throw new BadRequestException('Access denied or file not found');
    }

    return this.buildProfileImagePath(requestedFilename);
  }

  private buildProfileImagePath(filename: string): string {
    // Always build file paths on the server. Never trust a client-provided path.
    // path.basename removes folder tricks like "../../secret.txt".
    return path.join(USER_IMAGES_DIR, path.basename(filename));
  }

  private async deleteProfileImageFile(filename: string): Promise<void> {
    const imagePath = this.buildProfileImagePath(filename);

    try {
      await fs.unlink(imagePath);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      // ENOENT means the database had a filename, but the file is already gone.
      // That should not block updating/removing the user's profile image.
      if (nodeError.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
