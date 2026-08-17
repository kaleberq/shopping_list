import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanOrmEntity } from './plan.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index('idx_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'preferred_currency', type: 'varchar', length: 3, default: 'BRL' })
  preferredCurrency!: string;

  @Column({ name: 'plan_id', type: 'bigint' })
  planId!: string;

  @ManyToOne(() => PlanOrmEntity, { nullable: false, eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
