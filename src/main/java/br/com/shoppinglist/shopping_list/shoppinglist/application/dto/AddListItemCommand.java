package br.com.shoppinglist.shopping_list.shoppinglist.application.dto;

public record AddListItemCommand(
	String listId,
	String itemId,
	String description,
	Double price,
	String expiry
) {
}
