package br.com.shoppinglist.shopping_list.shoppinglist.application.usecase;

import br.com.shoppinglist.shopping_list.shoppinglist.application.dto.AddListItemCommand;
import br.com.shoppinglist.shopping_list.shoppinglist.application.port.in.AddListItemUseCase;
import br.com.shoppinglist.shopping_list.shoppinglist.application.port.out.ShoppingListRepository;
import br.com.shoppinglist.shopping_list.shoppinglist.domain.model.ShoppingListItem;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AddListItemUseCaseImpl implements AddListItemUseCase {

	private final ShoppingListRepository shoppingListRepository;

	public AddListItemUseCaseImpl(ShoppingListRepository shoppingListRepository) {
		this.shoppingListRepository = shoppingListRepository;
	}

	@Override
	public List<ShoppingListItem> execute(AddListItemCommand command) {
		if (command.description() == null || command.description().isBlank()) {
			return shoppingListRepository.findAll(command.listId());
		}

		String itemId = command.itemId() == null || command.itemId().isBlank()
			? UUID.randomUUID().toString()
			: command.itemId();

		ShoppingListItem item = new ShoppingListItem(
			itemId,
			command.description(),
			command.price(),
			command.expiry()
		);

		return shoppingListRepository.saveItem(command.listId(), item);
	}
}
