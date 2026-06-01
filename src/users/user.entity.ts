import { Exclude } from 'class-transformer';
import { Product } from 'src/products/product.entity';
import { Review } from 'src/reviews/review.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { UserType } from 'src/utils/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 250, unique: true, nullable: true })
  // @Exclude() //for testing Exclude email from serialization to prevent it from being exposed in API responses
  email: string;

  @Column({
    type: 'varchar',
    length: 255, // Also set a max length at database level
    nullable: true, // Keep this temporarily until you fix your database issue
  })
  @Exclude() // Exclude password from serialization to prevent it from being exposed in API responses
  password: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType: UserType;

  @Column({ type: 'boolean', default: false })
  isAccountVerified: boolean;

  // Relations

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  // Nullable because a user may register before uploading a profile image.
  @Column({ nullable: true, default: null })
  profileImage: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  updatedAt: Date;
}
