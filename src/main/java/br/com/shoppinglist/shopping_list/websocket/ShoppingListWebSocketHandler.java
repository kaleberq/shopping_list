package br.com.shoppinglist.shopping_list.websocket;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
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
	private final Map<String, Set<WebSocketSession>> sessionsByListId = new ConcurrentHashMap<>();
	private final Map<String, String> listIdBySessionId = new ConcurrentHashMap<>();
	private final Map<String, CopyOnWriteArrayList<ShoppingListItem>> itemsByListId = new ConcurrentHashMap<>();

	public ShoppingListWebSocketHandler(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
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

		// New client receives full list state (another device may have added items earlier).
		sendUpdatedList(session, listId);
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
			addItemToList(listId, readPayloadAsMap(root.get("payload")));
			broadcastUpdatedList(listId);
			return;
		}

		SocketEvent event = objectMapper.treeToValue(root, SocketEvent.class);
		SocketEvent normalized = new SocketEvent(event.type(), listId, event.payload());
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

	private void addItemToList(String listId, Map<String, Object> map) {
		if (map == null) {
			return;
		}

		String providedId = stringValue(map.get("itemId"));
		String description = stringValue(map.get("description"));
		if (description == null || description.isBlank()) {
			return;
		}

		Double price = doubleValue(map.get("price"));
		String expiry = stringValue(map.get("expiry"));

		CopyOnWriteArrayList<ShoppingListItem> list =
			itemsByListId.computeIfAbsent(listId, id -> new CopyOnWriteArrayList<>());

		if (providedId == null || providedId.isBlank()) {
			String newId = UUID.randomUUID().toString();
			list.add(new ShoppingListItem(newId, description, price, expiry));
			return;
		}

		list.removeIf(existing -> providedId.equals(existing.itemId()));
		list.add(new ShoppingListItem(providedId, description, price, expiry));
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

	private List<ShoppingListItem> copyItems(String listId) {
		CopyOnWriteArrayList<ShoppingListItem> list = itemsByListId.get(listId);
		if (list == null || list.isEmpty()) {
			return List.of();
		}
		return new ArrayList<>(list);
	}

	private void sendUpdatedList(WebSocketSession session, String listId) throws Exception {
		Map<String, Object> body = Map.of("items", copyItems(listId));
		SocketEvent outbound = new SocketEvent(EVENT_LIST_UPDATED, listId, body);
		String json = objectMapper.writeValueAsString(outbound);
		if (session.isOpen()) {
			session.sendMessage(new TextMessage(json));
		}
	}

	private void broadcastUpdatedList(String listId) throws Exception {
		Map<String, Object> body = Map.of("items", copyItems(listId));
		SocketEvent outbound = new SocketEvent(EVENT_LIST_UPDATED, listId, body);
		String json = objectMapper.writeValueAsString(outbound);
		for (WebSocketSession client : sessionsByListId.getOrDefault(listId, Set.of())) {
			if (client.isOpen()) {
				client.sendMessage(new TextMessage(json));
			}
		}
	}

	private String extractListId(URI uri) {
		if (uri == null) {
			return null;
		}
		return UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("listId");
	}
}
