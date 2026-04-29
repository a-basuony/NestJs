import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import { BadRequestException, Body, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
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
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  private generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
