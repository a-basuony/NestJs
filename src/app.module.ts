import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Product } from './products/product.entity';
import { User } from './users/user.entity';
import { Review } from './reviews/review.entity';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [Product, User, Review],
          synchronize: process.env.NODE_ENV === 'development', // Only for development – auto-creates tables
          // if in production synchronize should be false and migrations should be used instead
        };
      },
    }),
  ],
})
export class AppModule {}
