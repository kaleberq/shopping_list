import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ShoppingListItem } from '../../domain/model/shopping-list-item';
import { AddListItemCommand } from '../dto/add-list-item.command';
import { AddListItemUseCase } from '../port/in/add-list-item.use-case';
import { ShoppingListRepository } from '../port/out/shopping-list.repository';

@Injectable()
export class AddListItemUseCaseImpl extends AddListItemUseCase {
  constructor(private readonly shoppingListRepository: ShoppingListRepository) {
    super();
  }

  async execute(command: AddListItemCommand): Promise<ShoppingListItem[]> {
    if (!command.description?.trim()) {
      return this.shoppingListRepository.findAll(command.listId);
    }

    const itemId = command.itemId?.trim()
      ? command.itemId.trim()
      : randomUUID();
    const item: ShoppingListItem = {
      itemId,
      description: command.description,
      price: command.price ?? null,
      expiry: command.expiry ?? null,
    };

    return this.shoppingListRepository.saveItem(command.listId, item);
  }
}
