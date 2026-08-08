import { Injectable } from '@nestjs/common';
import { ShoppingListItem } from '../../domain/model/shopping-list-item';
import { GetListItemsUseCase } from '../port/in/get-list-items.use-case';
import { ShoppingListRepository } from '../port/out/shopping-list.repository';

@Injectable()
export class GetListItemsUseCaseImpl extends GetListItemsUseCase {
  constructor(private readonly shoppingListRepository: ShoppingListRepository) {
    super();
  }

  execute(listId: string): Promise<ShoppingListItem[]> {
    return this.shoppingListRepository.findAll(listId);
  }
}
