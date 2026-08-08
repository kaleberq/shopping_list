import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { ShoppingListItem } from '../../../../domain/model/shopping-list-item';
import { AddListItemUseCase } from '../../../../application/port/in/add-list-item.use-case';
import { GetListItemsUseCase } from '../../../../application/port/in/get-list-items.use-case';

type SocketEvent = {
  type: string;
  listId?: string;
  payload?: Record<string, unknown> | null;
};

@Injectable()
export class ShoppingListWsServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ShoppingListWsServer.name);
  private wss?: WebSocketServer;
  private readonly sessionsByListId = new Map<string, Set<WebSocket>>();
  private readonly listIdBySocket = new Map<WebSocket, string>();

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly addListItem: AddListItemUseCase,
    private readonly getListItems: GetListItemsUseCase,
  ) {}

  onModuleInit() {
    const server = this.httpAdapterHost.httpAdapter.getHttpServer();
    this.wss = new WebSocketServer({ server, path: '/ws/list' });
    this.wss.on('connection', (socket, request) => this.handleConnection(socket, request));
    this.logger.log('WebSocket listening on /ws/list');
  }

  onModuleDestroy() {
    this.wss?.close();
  }

  private handleConnection(socket: WebSocket, request: IncomingMessage) {
    const listId = this.extractListId(request.url);
    if (!listId) {
      socket.close(1007, 'listId is required');
      return;
    }

    this.listIdBySocket.set(socket, listId);
    const room = this.sessionsByListId.get(listId) ?? new Set<WebSocket>();
    room.add(socket);
    this.sessionsByListId.set(listId, room);

    void this.getListItems.execute(listId).then((items) => {
      this.sendListUpdated(socket, listId, items);
    });

    socket.on('message', (raw) => {
      void this.handleMessage(socket, raw.toString());
    });

    socket.on('close', () => {
      this.removeSocket(socket);
    });
  }

  private async handleMessage(socket: WebSocket, raw: string) {
    const listId = this.listIdBySocket.get(socket);
    if (!listId) {
      socket.close(1007, 'listId is required');
      return;
    }

    let root: SocketEvent;
    try {
      root = JSON.parse(raw) as SocketEvent;
    } catch {
      return;
    }

    const eventType = (root.type ?? '').trim();
    if (eventType === 'ITEM_ADDED') {
      const payload = (root.payload ?? {}) as Record<string, unknown>;
      const items = await this.addListItem.execute({
        listId,
        itemId: this.stringValue(payload.itemId),
        description: this.stringValue(payload.description),
        price: this.doubleValue(payload.price),
        expiry: this.stringValue(payload.expiry),
      });
      this.broadcastListUpdated(listId, items);
      return;
    }

    const outbound: SocketEvent = {
      type: root.type,
      listId,
      payload: root.payload ?? null,
    };
    const json = JSON.stringify(outbound);
    for (const client of this.sessionsByListId.get(listId) ?? []) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    }
  }

  private sendListUpdated(socket: WebSocket, listId: string, items: ShoppingListItem[]) {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: 'LIST_UPDATED',
        listId,
        payload: { items },
      }),
    );
  }

  private broadcastListUpdated(listId: string, items: ShoppingListItem[]) {
    const json = JSON.stringify({
      type: 'LIST_UPDATED',
      listId,
      payload: { items },
    });
    for (const client of this.sessionsByListId.get(listId) ?? []) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    }
  }

  private removeSocket(socket: WebSocket) {
    const listId = this.listIdBySocket.get(socket);
    this.listIdBySocket.delete(socket);
    if (!listId) {
      return;
    }
    const room = this.sessionsByListId.get(listId);
    if (!room) {
      return;
    }
    room.delete(socket);
    if (room.size === 0) {
      this.sessionsByListId.delete(listId);
    }
  }

  private extractListId(url?: string): string | null {
    if (!url) {
      return null;
    }
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
    const params = new URLSearchParams(query);
    const listId = params.get('listId');
    return listId?.trim() ? listId.trim() : null;
  }

  private stringValue(value: unknown): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    return String(value).trim();
  }

  private doubleValue(value: unknown): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
