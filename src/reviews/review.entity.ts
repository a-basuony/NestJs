import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews') // table name in DB
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 1000 })
  comment: string;

  // relations

  @ManyToOne(() => Product, (product) => product.reviews, {
    nullable: false,
    onDelete: 'CASCADE', // when you delete the product , you will delete also the reviews related to that product
  })
  product: Product; // Which product this review is for

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: false,
    onDelete: 'CASCADE', // when you delete the user you will delete also the reviews related to that user
  })
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  updatedAt: Date;
}
