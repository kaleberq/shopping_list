---
name: websocket-event-builder
description: Adds or changes native WebSocket events on /ws/list for shopping_list. Use when the user mentions WebSocket, ITEM_ADDED, LIST_UPDATED, rooms, listId, or realtime sync. Do not introduce Socket.IO unless explicitly requested.
---

# WebSocket Event Builder

Eventos em tempo real via **WebSocket nativo** (`ws`) em `ShoppingListWsServer`.

## ⚠️ CRITICAL SAFETY RULES ⚠️

- **NEVER** trocar para Socket.IO sem pedido explícito.
- **NEVER** colocar regra/TypeORM no handler WS — usar `ShoppingListService`.
- **NEVER** exigir JWT no WS sem o usuário pedir.
- Chaves JSON e `type` em **inglês**.

## Contrato atual

- URL: `ws://host/ws/list?listId=<string>`
- Connect → `LIST_UPDATED` com `payload.items`
- In: `ITEM_ADDED` + `{ description, price?, expiry?, itemId? }`
- Out: broadcast `LIST_UPDATED` na sala `listId`
- Outros `type`: fan-out na mesma sala

## Workflow

1. Perguntar: inbound, outbound, ou ambos? Persiste?
2. Se persistir → `ShoppingListService` (+ `typeorm-schema-updater` se schema mudar)
3. Em `shopping-list.ws.ts`: parse seguro → branch por `type` → `await` service → broadcast
4. Checklist

## Template inbound

```typescript
if (eventType === 'ITEM_REMOVED') {
  const payload = (root.payload ?? {}) as Record<string, unknown>;
  const items = await this.shoppingListService.removeItem({
    listId,
    itemId: this.stringValue(payload.itemId),
  });
  this.broadcastListUpdated(listId, items);
  return;
}
```

## Checklist

- [ ] Evento no WS server
- [ ] Regra no service
- [ ] Sala por `listId`
- [ ] Envelope JSON estável
- [ ] Sem Socket.IO
- [ ] Schema atualizado se necessário

## Teste manual

```bash
npx wscat -c "ws://localhost:8080/ws/list?listId=demo"
```
