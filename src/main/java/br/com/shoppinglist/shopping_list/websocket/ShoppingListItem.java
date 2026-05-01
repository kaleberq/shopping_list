package br.com.shoppinglist.shopping_list.websocket;

public record ShoppingListItem(
	String itemId,
	String description,
	Double price,
	String expiry
) {
}
