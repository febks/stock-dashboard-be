import { Holding } from '../holdings/holding.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  name!: string;

  @OneToMany(() => Holding, (holding) => holding.user)
  holdings!: Holding[];

  @CreateDateColumn()
  createdAt!: Date;
}
