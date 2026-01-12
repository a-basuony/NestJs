import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UsersService } from './../users/users.service';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private usersService: UsersService,
  ) {}

  /**
   * Create a new product
   */
  public async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);

    return await this.productRepository.save(product);
  }

  /**
   * Get all products
   */
  public findAll() {
    return this.productRepository.find();
  }

  /**
   * Get product by id
   */
  public async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Update product
   */
  public async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id); // Reuse findOne for validation
    // product.title = updateProductDto.title ?? product.title;
    // product.description = updateProductDto.description ?? product.description;
    // product.price = updateProductDto.price ?? product.price;

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  /**
   * Delete product
   */
  public async delete(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
