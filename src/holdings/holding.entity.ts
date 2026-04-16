import { User } from '@/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('holdings')
export class Holding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticker!: string;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 4 })
  lots!: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  avgBuyPrice!: number;

  @Column({ type: 'date', nullable: true })
  buyDate!: string;

  @Column({ nullable: true })
  exchange!: string;

  @ManyToOne(() => User, (user) => user.holdings, { onDelete: 'CASCADE' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
