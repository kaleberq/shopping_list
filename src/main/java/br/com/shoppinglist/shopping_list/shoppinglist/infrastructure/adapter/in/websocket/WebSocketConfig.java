package br.com.shoppinglist.shopping_list.shoppinglist.infrastructure.adapter.in.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final ShoppingListWebSocketHandler shoppingListWebSocketHandler;

	public WebSocketConfig(ShoppingListWebSocketHandler shoppingListWebSocketHandler) {
		this.shoppingListWebSocketHandler = shoppingListWebSocketHandler;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(shoppingListWebSocketHandler, "/ws/list")
			.setAllowedOriginPatterns("*");
	}
}
