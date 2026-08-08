import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shopping_list_items')
export class ShoppingListItemOrmEntity {
  @PrimaryColumn({ name: 'item_id', type: 'varchar', length: 64 })
  itemId!: string;

  @Index('idx_shopping_list_items_list_id')
  @Column({ name: 'list_id', type: 'varchar', length: 128 })
  listId!: string;

  @Column({ type: 'varchar', length: 512 })
  description!: string;

  @Column({ type: 'double precision', nullable: true })
  price!: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  expiry!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
