import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

    // Prepare HTML email content
    const loginTime = new Date().toLocaleString();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h1 style="color: #333;">Hello ${user.username},</h1>
        <p>You have successfully logged in to your account.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li><strong>Time:</strong> ${loginTime}</li>
          <li><strong>IP Address:</strong> ${loginTime}</li>
        </ul>
        <p>If this wasn't you, please reset your password immediately.</p>
        <hr />
        <small style="color: #777;">This is an automated message, please do not reply.</small>
      </div>
    `;

    // Send email notification asynchronously (fire-and-forget)
    this.mailService
      .sendEmail(user.email, '🔐 Login Notification', htmlContent)
      .catch((error) =>
        console.log(`Failed to send login email: ${error.message}`),
      );
    return { accessToken };
  }

  /**
   *  Hash the user's password using bcrypt
   * @param password  - The plain text password to be hashed
   * @returns  A promise that resolves to the hashed password as a string
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  /**
   *  Generate JWT token for authenticated user
   * @param payload
   * @returns  JWT token as a string
   */
  private generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
