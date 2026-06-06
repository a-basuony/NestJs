import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService], // Import ConfigModule to use ConfigService
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false, // false for development (no TLS). Set to 'true' for production.
          auth: {
            user: configService.get<string>('SMTP_USERNAME'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
