import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class JWTAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('access denied, no token provided');
    }

    const [type, token] = authHeader.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token type');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload: JWTPayloadType = await this.jwtService.verifyAsync(token, {
        secret,
      });
      request['user'] = payload; // Attach the decoded payload to the request object
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
