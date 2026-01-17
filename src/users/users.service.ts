import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import { BadRequestException, Body, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   *@param RegisterDto - user registration details
   *@return created user object
   */
  public async register(registerDto: RegisterDto) {
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

    // @TODO: generate JWT token
    return newUser;
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email or password is incorrect');

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch)
      throw new BadRequestException('Email or password is incorrect');

    return user;
  }
}
