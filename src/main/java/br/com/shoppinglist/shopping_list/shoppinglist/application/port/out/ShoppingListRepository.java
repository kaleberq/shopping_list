package br.com.shoppinglist.shopping_list.shoppinglist.application.port.out;

import br.com.shoppinglist.shopping_list.shoppinglist.domain.model.ShoppingListItem;
import java.util.List;

public interface ShoppingListRepository {

	List<ShoppingListItem> findAll(String listId);

	List<ShoppingListItem> saveItem(String listId, ShoppingListItem item);
}
