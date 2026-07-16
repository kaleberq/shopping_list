import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { ShoppingListItemEntity } from './entities/shopping-list-item.entity';
import { ShoppingListItem } from './shopping-list-item';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(ShoppingListItemEntity)
    private readonly items: Repository<ShoppingListItemEntity>,
  ) {}

  async findAll(listId: string): Promise<ShoppingListItem[]> {
    const rows = await this.items.find({
      where: { listId },
      order: { createdAt: 'ASC' },
    });
    return rows.map((row) => this.toItem(row));
  }

  async addItem(input: {
    listId: string;
    itemId?: string | null;
    description?: string | null;
    price?: number | null;
    expiry?: string | null;
  }): Promise<ShoppingListItem[]> {
    if (!input.description?.trim()) {
      return this.findAll(input.listId);
    }

    const itemId = input.itemId?.trim() ? input.itemId.trim() : randomUUID();
    const existing = await this.items.findOne({ where: { itemId } });

    if (existing) {
      existing.listId = input.listId;
      existing.description = input.description;
      existing.price = input.price ?? null;
      existing.expiry = input.expiry ?? null;
      await this.items.save(existing);
    } else {
      await this.items.save(
        this.items.create({
          itemId,
          listId: input.listId,
          description: input.description,
          price: input.price ?? null,
          expiry: input.expiry ?? null,
        }),
      );
    }

    return this.findAll(input.listId);
  }

  private toItem(row: ShoppingListItemEntity): ShoppingListItem {
    return {
      itemId: row.itemId,
      description: row.description,
      price: row.price,
      expiry: row.expiry,
    };
  }
}
