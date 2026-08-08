import { ShoppingListItem } from '../../../domain/model/shopping-list-item';
import { AddListItemCommand } from '../../dto/add-list-item.command';

export abstract class AddListItemUseCase {
  abstract execute(command: AddListItemCommand): Promise<ShoppingListItem[]>;
}
