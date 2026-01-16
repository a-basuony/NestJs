import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly config: ConfigService,
  ) {}

  // POST : ~/api/products
  @Post()
  public CreateProduct(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: CreateProductDto,
  ) {
    return this.productsService.create(body);
  }

  // GET : ~/api/products
  @Get()
  public GetAllProducts() {
    const sample = this.config.get<string>('SAMPLE');
    const sample1 = process.env.SAMPLE; // not recommended in Nestjs
    console.log(sample, sample1);
    return this.productsService.findAll();
  }

  @Get(':id')
  public GetProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: UpdateProductDto,
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
