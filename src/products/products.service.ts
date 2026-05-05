import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new product (admin only).
   * @param createDto - product data from client
   * @param payload - JWT payload of the requester (contains userId)
   */
  public async create(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    const user = await this.usersService.getCurrentUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Convert title to lowercase (optional normalization)
    const normalizedTitle = createProductDto.title.toLowerCase();

    // 3. Create and save product
    const newProduct = this.productRepository.create({
      ...createProductDto,
      title: normalizedTitle,
      user, // assign the user entity (TypeORM will store userId automatically)
    });

    return this.productRepository.save(newProduct);
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
