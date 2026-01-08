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
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

type ProductType = {
  id: number;
  name: string;
  price: number;
};

@Controller('api/products')
export class ProductsController {
  private products: ProductType[] = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 },
  ];

  // POST : ~/api/products
  @Post()
  public CreateProduct(@Body() body: CreateProductDto) {
    const newProduct = {
      id: this.products.length + 1,
      name: body.name,
      price: body.price,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  // GET : ~/api/products
  @Get()
  public GetAllProducts() {
    return this.products;
  }

  @Get(':id')
  public GetProductById(@Param('id', ParseIntPipe) id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Put(':id')
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found', 'Update Operation');
    }
    console.log(body);
    return product;
  }

  @Delete(':id')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found', 'Delete Operation');
    }
    this.products = this.products.filter((p) => p.id !== id);

    return this.products;
  }
}
