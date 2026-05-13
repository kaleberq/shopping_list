package br.com.shoppinglist.shopping_list.shoppinglist.infrastructure.adapter.out.persistence;

import br.com.shoppinglist.shopping_list.shoppinglist.application.port.out.ShoppingListRepository;
import br.com.shoppinglist.shopping_list.shoppinglist.domain.model.ShoppingListItem;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryShoppingListRepository implements ShoppingListRepository {

	private final Map<String, CopyOnWriteArrayList<ShoppingListItem>> itemsByListId = new ConcurrentHashMap<>();

	@Override
	public List<ShoppingListItem> findAll(String listId) {
		CopyOnWriteArrayList<ShoppingListItem> list = itemsByListId.get(listId);
		if (list == null || list.isEmpty()) {
			return List.of();
		}
		return new ArrayList<>(list);
	}

	@Override
	public List<ShoppingListItem> saveItem(String listId, ShoppingListItem item) {
		CopyOnWriteArrayList<ShoppingListItem> list =
			itemsByListId.computeIfAbsent(listId, id -> new CopyOnWriteArrayList<>());
		list.removeIf(existing -> existing.itemId().equals(item.itemId()));
		list.add(item);
		return new ArrayList<>(list);
	}
}
