import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create a new user
   *@param RegisterDto - user registration details
   *@return created user object & JWT token (to be implemented)
   */
  public async register(registerDto: RegisterDto): Promise<AccessTokenType> {
    //1. check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    //2. if user exists, throw error
    if (existingUser) throw new BadRequestException('User already exists');

    //3. hash password

    const hashedPassword = await this.hashPassword(registerDto.password);

    let newUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    newUser = await this.userRepository.save(newUser);

    // @TODO: verify Email before allowing login using the token

    //  generate JWT token
    const payload: JWTPayloadType = {
      id: newUser.id,
      userType: newUser.userType,
    };
    const accessToken = await this.generateJWT(payload);

    return {
      accessToken,
    };
  }

  /**
   * Login user
   *@param LoginDto - user login details
   *@return user object & JWT token (access token)
   */
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email or password is incorrect');

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch)
      throw new BadRequestException('Email or password is incorrect');

    //  generate JWT token
    const payload: JWTPayloadType = {
      id: user.id,
      userType: user.userType,
    };
    const accessToken = await this.generateJWT(payload);

    return { accessToken };
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
      user.password = await this.hashPassword(updateData.password);
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
   *  Generate JWT token for authenticated user
   * @param payload
   * @returns  JWT token as a string
   */
  private generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   *  Hash the user's password using bcrypt
   * @param password  - The plain text password to be hashed
   * @returns  A promise that resolves to the hashed password as a string
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
