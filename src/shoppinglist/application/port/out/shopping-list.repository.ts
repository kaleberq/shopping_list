import { ShoppingListItem } from '../../../domain/model/shopping-list-item';

export abstract class ShoppingListRepository {
  abstract findAll(listId: string): Promise<ShoppingListItem[]>;
  abstract saveItem(
    listId: string,
    item: ShoppingListItem,
  ): Promise<ShoppingListItem[]>;
}
