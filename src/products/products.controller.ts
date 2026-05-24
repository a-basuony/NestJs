import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/users/decorators/roles.decorator';
import { UserType } from 'src/utils/enums';
import { JWTAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { RolesGuard } from 'src/users/guards/roles.guard';
import type { JWTPayloadType } from 'src/utils/types';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly config: ConfigService,
  ) {}

  // POST : ~/api/products
  @Post()
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  public CreateProduct(
    @Body()
    body: CreateProductDto,
    @CurrentUser()
    payload: JWTPayloadType,
  ) {
    return this.productsService.create(body, payload.id);
  }

  // GET : ~/api/products
  @Get()
  public GetAllProducts(@Query('title') title?: string, @Query('minPrice') minPrice?: string , @Query('maxPrice') maxPrice?: string ) {
    return this.productsService.findAll( title, minPrice, maxPrice);
  }

  @Get(':id')
  public GetProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: UpdateProductDto,
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
