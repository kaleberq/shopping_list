import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingListRepository } from '../../../../application/port/out/shopping-list.repository';
import { ShoppingListItem } from '../../../../domain/model/shopping-list-item';
import { ShoppingListItemOrmEntity } from './shopping-list-item.orm-entity';

@Injectable()
export class TypeOrmShoppingListRepository extends ShoppingListRepository {
  constructor(
    @InjectRepository(ShoppingListItemOrmEntity)
    private readonly items: Repository<ShoppingListItemOrmEntity>,
  ) {
    super();
  }

  async findAll(listId: string): Promise<ShoppingListItem[]> {
    const rows = await this.items.find({
      where: { listId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async saveItem(
    listId: string,
    item: ShoppingListItem,
  ): Promise<ShoppingListItem[]> {
    const existing = await this.items.findOne({
      where: { itemId: item.itemId },
    });
    if (existing) {
      existing.listId = listId;
      existing.description = item.description;
      existing.price = item.price;
      existing.expiry = item.expiry;
      await this.items.save(existing);
    } else {
      await this.items.save(
        this.items.create({
          itemId: item.itemId,
          listId,
          description: item.description,
          price: item.price,
          expiry: item.expiry,
        }),
      );
    }
    return this.findAll(listId);
  }

  private toDomain(row: ShoppingListItemOrmEntity): ShoppingListItem {
    return {
      itemId: row.itemId,
      description: row.description,
      price: row.price,
      expiry: row.expiry,
    };
  }
}
