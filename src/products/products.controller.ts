import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  private productsService: ProductsService = new ProductsService();
  // POST : ~/api/products
  @Post()
  public CreateProduct(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: CreateProductDto,
  ) {
    return this.productsService.CreateProduct(body);
  }

  // GET : ~/api/products
  @Get()
  public GetAllProducts() {
    return this.productsService.GetAllProducts();
  }

  @Get(':id')
  public GetProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.GetProductById(id);
  }

  @Put(':id')
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
