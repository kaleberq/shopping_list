package br.com.shoppinglist.shopping_list.shoppinglist.domain.model;

public record ShoppingListItem(
	String itemId,
	String description,
	Double price,
	String expiry
) {
}
