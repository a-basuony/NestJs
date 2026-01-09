import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

type ProductType = {
  id: number;
  name: string;
  price: number;
};

export class ProductsService {
  private products: ProductType[] = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 },
  ];

  /**
   * Create a new product
   */
  public CreateProduct({ name, price }: CreateProductDto) {
    // Validation happens before this code executes
    const newProduct = {
      id: this.products.length + 1,
      name: name,
      price: price,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  /**
   * Get all products
   */
  public GetAllProducts() {
    return this.products;
  }

  public GetProductById(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  public updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found', 'Update Operation');
    }
    console.log(updateProductDto);
    return product;
  }

  public deleteProduct( id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found', 'Delete Operation');
    }
    this.products = this.products.filter((p) => p.id !== id);

    return this.products;
  }
}
