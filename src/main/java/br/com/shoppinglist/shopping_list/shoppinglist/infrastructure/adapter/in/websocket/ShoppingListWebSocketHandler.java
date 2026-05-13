package br.com.shoppinglist.shopping_list.shoppinglist.infrastructure.adapter.in.websocket;

import br.com.shoppinglist.shopping_list.shoppinglist.application.dto.AddListItemCommand;
import br.com.shoppinglist.shopping_list.shoppinglist.application.port.in.AddListItemUseCase;
import br.com.shoppinglist.shopping_list.shoppinglist.application.port.out.ShoppingListRepository;
import br.com.shoppinglist.shopping_list.shoppinglist.domain.model.ShoppingListItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.util.List;
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

	private static final String EVENT_ITEM_ADDED = "ITEM_ADDED";
	private static final String EVENT_LIST_UPDATED = "LIST_UPDATED";

	private final ObjectMapper objectMapper;
	private final AddListItemUseCase addListItemUseCase;
	private final ShoppingListRepository shoppingListRepository;
	private final Map<String, Set<WebSocketSession>> sessionsByListId = new ConcurrentHashMap<>();
	private final Map<String, String> listIdBySessionId = new ConcurrentHashMap<>();

	public ShoppingListWebSocketHandler(
		ObjectMapper objectMapper,
		AddListItemUseCase addListItemUseCase,
		ShoppingListRepository shoppingListRepository
	) {
		this.objectMapper = objectMapper;
		this.addListItemUseCase = addListItemUseCase;
		this.shoppingListRepository = shoppingListRepository;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		String listId = extractListId(session.getUri());
		if (listId == null || listId.isBlank()) {
			session.close(CloseStatus.BAD_DATA);
			return;
		}

		listIdBySessionId.put(session.getId(), listId);
		sessionsByListId.computeIfAbsent(listId, ignored -> ConcurrentHashMap.newKeySet()).add(session);

		sendListUpdated(session, listId, shoppingListRepository.findAll(listId));
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		String listId = listIdBySessionId.get(session.getId());
		if (listId == null) {
			session.close(CloseStatus.BAD_DATA);
			return;
		}

		JsonNode root = objectMapper.readTree(message.getPayload());
		String eventType = root.path("type").asText("").trim();

		if (EVENT_ITEM_ADDED.equals(eventType)) {
			Map<String, Object> map = readPayloadAsMap(root.get("payload"));
			AddListItemCommand command = new AddListItemCommand(
				listId,
				stringValue(map != null ? map.get("itemId") : null),
				stringValue(map != null ? map.get("description") : null),
				doubleValue(map != null ? map.get("price") : null),
				stringValue(map != null ? map.get("expiry") : null)
			);
			List<ShoppingListItem> items = addListItemUseCase.execute(command);
			broadcastListUpdated(listId, items);
			return;
		}

		SocketEventDTO event = objectMapper.treeToValue(root, SocketEventDTO.class);
		SocketEventDTO normalized = new SocketEventDTO(event.type(), listId, event.payload());
		String outboundJson = objectMapper.writeValueAsString(normalized);
		for (WebSocketSession client : sessionsByListId.getOrDefault(listId, Set.of())) {
			if (client.isOpen()) {
				client.sendMessage(new TextMessage(outboundJson));
			}
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		String listId = listIdBySessionId.remove(session.getId());
		if (listId == null) {
			return;
		}

		Set<WebSocketSession> clients = sessionsByListId.get(listId);
		if (clients == null) {
			return;
		}

		clients.remove(session);
		if (clients.isEmpty()) {
			sessionsByListId.remove(listId);
		}
	}

	private Map<String, Object> readPayloadAsMap(JsonNode payloadNode) {
		if (payloadNode == null || payloadNode.isNull() || !payloadNode.isObject()) {
			return null;
		}
		return objectMapper.convertValue(payloadNode, new TypeReference<Map<String, Object>>() {});
	}

	private void sendListUpdated(WebSocketSession session, String listId, List<ShoppingListItem> items)
		throws Exception {
		Map<String, Object> body = Map.of("items", items);
		SocketEventDTO outbound = new SocketEventDTO(EVENT_LIST_UPDATED, listId, body);
		String json = objectMapper.writeValueAsString(outbound);
		if (session.isOpen()) {
			session.sendMessage(new TextMessage(json));
		}
	}

	private void broadcastListUpdated(String listId, List<ShoppingListItem> items) throws Exception {
		Map<String, Object> body = Map.of("items", items);
		SocketEventDTO outbound = new SocketEventDTO(EVENT_LIST_UPDATED, listId, body);
		String json = objectMapper.writeValueAsString(outbound);
		for (WebSocketSession client : sessionsByListId.getOrDefault(listId, Set.of())) {
			if (client.isOpen()) {
				client.sendMessage(new TextMessage(json));
			}
		}
	}

	private static String stringValue(Object value) {
		return value == null ? null : String.valueOf(value).trim();
	}

	private static Double doubleValue(Object value) {
		if (value == null) {
			return null;
		}
		if (value instanceof Number n) {
			return n.doubleValue();
		}
		try {
			return Double.parseDouble(String.valueOf(value));
		} catch (NumberFormatException e) {
			return null;
		}
	}

	private String extractListId(URI uri) {
		if (uri == null) {
			return null;
		}
		return UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("listId");
	}
}
