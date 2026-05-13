package br.com.shoppinglist.shopping_list.shoppinglist.application.port.in;

import br.com.shoppinglist.shopping_list.shoppinglist.application.dto.AddListItemCommand;
import br.com.shoppinglist.shopping_list.shoppinglist.domain.model.ShoppingListItem;
import java.util.List;

public interface AddListItemUseCase {

	List<ShoppingListItem> execute(AddListItemCommand command);
}
