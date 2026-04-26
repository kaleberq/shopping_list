package br.com.shoppinglist.shopping_list.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class ShoppingListWebSocketHandler extends TextWebSocketHandler {

	private final ObjectMapper objectMapper;
	private final Map<String, Set<WebSocketSession>> salas = new ConcurrentHashMap<>();
	private final Map<String, String> listaPorSessao = new ConcurrentHashMap<>();

	public ShoppingListWebSocketHandler(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		String listId = extrairListId(session.getUri());
		if (listId == null || listId.isBlank()) {
			session.close(CloseStatus.BAD_DATA);
			return;
		}

		listaPorSessao.put(session.getId(), listId);
		salas.computeIfAbsent(listId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		String listId = listaPorSessao.get(session.getId());
		if (listId == null) {
			session.close(CloseStatus.BAD_DATA);
			return;
		}

		SocketEvent evento = objectMapper.readValue(message.getPayload(), SocketEvent.class);
		SocketEvent eventoNormalizado = new SocketEvent(evento.type(), listId, evento.payload());
		String jsonSaida = objectMapper.writeValueAsString(eventoNormalizado);

		for (WebSocketSession cliente : salas.getOrDefault(listId, Set.of())) {
			if (cliente.isOpen()) {
				cliente.sendMessage(new TextMessage(jsonSaida));
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		String listId = listaPorSessao.remove(session.getId());
		if (listId == null) {
			return;
		}

		Set<WebSocketSession> clientes = salas.get(listId);
		if (clientes == null) {
			return;
		}

		clientes.remove(session);
		if (clientes.isEmpty()) {
			salas.remove(listId);
		}
	}

	private String extrairListId(URI uri) {
		if (uri == null) {
			return null;
		}
		return UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("listId");
	}
}
