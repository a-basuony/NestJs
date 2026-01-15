import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Product } from './products/product.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigModule],
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345',
      database: 'nest_db',
      entities: [Product],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
