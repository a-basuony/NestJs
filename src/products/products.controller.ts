import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
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

  // // POST : ~/api/products/express-way
  // @Post('express-way')
  // public CreateProductExpressWay(
  //   @Req() req: Request,
  //   @Res({passThrough: true}) res: Response,
  //   @Headers() headers: any,
  // ) {
  //   const newProduct = {
  //     id: this.products.length + 1,
  //     name: req.body.name,
  //     price: req.body.price,
  //   };

  //   this.products.push(newProduct);
  //   console.log('Headers:', headers);
  //   res.cookie('auth','this is a cookie', { httpOnly: true , maxAge: 120});
  //   res.status(201).json(newProduct); // newProduct;
  // }


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
  public GetProductById(@Param('id') id: string) {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Put(':id')
  public updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found', 'Update Operation');
    }
    console.log(body);
    return product;
  }

  @Delete(':id')
  public deleteProduct(@Param('id') id: string) {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found', 'Delete Operation');
    }
    this.products = this.products.filter((p) => p.id !== parseInt(id));

    return this.products;
  }
}
