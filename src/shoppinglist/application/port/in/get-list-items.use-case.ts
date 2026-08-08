import { ShoppingListItem } from '../../../domain/model/shopping-list-item';

export abstract class GetListItemsUseCase {
  abstract execute(listId: string): Promise<ShoppingListItem[]>;
}
