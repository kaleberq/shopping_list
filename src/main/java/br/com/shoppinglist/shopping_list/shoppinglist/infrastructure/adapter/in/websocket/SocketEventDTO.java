package br.com.shoppinglist.shopping_list.shoppinglist.infrastructure.adapter.in.websocket;

public record SocketEventDTO(
	String type,
	String listId,
	Object payload
) {
}
