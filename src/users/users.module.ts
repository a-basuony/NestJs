import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProvider } from './auth.provider';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'defaultSecret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1d') as any,
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  exports: [UsersService],
})
export class UsersModule {}
