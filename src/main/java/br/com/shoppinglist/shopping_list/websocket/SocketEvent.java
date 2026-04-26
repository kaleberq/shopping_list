package br.com.shoppinglist.shopping_list.websocket;

public record SocketEvent(
	String type,
	String listId,
	Object payload
) {
}
