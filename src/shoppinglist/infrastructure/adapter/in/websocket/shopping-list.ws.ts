import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage, Server } from 'http';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { EmptyItemDescriptionException } from '../../../../domain/exception/shopping-list.exceptions';
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
    private readonly jwtService: JwtService,
    private readonly addListItem: AddListItemUseCase,
    private readonly getListItems: GetListItemsUseCase,
  ) {}

  onModuleInit() {
    const server = this.httpAdapterHost.httpAdapter.getHttpServer() as Server;
    this.wss = new WebSocketServer({
      server,
      path: '/ws/list',
      verifyClient: (info, done) => {
        void this.verifyClient(info.req)
          .then((ok) =>
            done(ok, ok ? 200 : 401, ok ? undefined : 'Unauthorized'),
          )
          .catch(() => done(false, 401, 'Unauthorized'));
      },
    });
    this.wss.on('connection', (socket, request) =>
      this.handleConnection(socket, request),
    );
    this.logger.log('WebSocket listening on /ws/list');
  }

  onModuleDestroy() {
    this.wss?.close();
  }

  private async verifyClient(request: IncomingMessage): Promise<boolean> {
    const token = this.extractBearerToken(request);
    if (!token) {
      return false;
    }
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string }>(
        token,
      );
      return Boolean(payload.sub);
    } catch {
      return false;
    }
  }

  private extractBearerToken(request: IncomingMessage): string | null {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return null;
    }
    const token = header.slice('Bearer '.length).trim();
    return token || null;
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

    socket.on('message', (raw: RawData) => {
      void this.handleMessage(socket, this.rawToString(raw));
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
      const payload = root.payload ?? {};
      try {
        const items = await this.addListItem.execute({
          listId,
          itemId: this.stringValue(payload.itemId),
          description: this.stringValue(payload.description),
          price: this.doubleValue(payload.price),
          expiry: this.stringValue(payload.expiry),
        });
        this.broadcastListUpdated(listId, items);
      } catch (error) {
        if (error instanceof EmptyItemDescriptionException) {
          return;
        }
        this.logger.warn(
          `ITEM_ADDED failed: ${error instanceof Error ? error.message : error}`,
        );
      }
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

  private sendListUpdated(
    socket: WebSocket,
    listId: string,
    items: ShoppingListItem[],
  ) {
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

  private rawToString(raw: RawData): string {
    if (typeof raw === 'string') {
      return raw;
    }
    if (Buffer.isBuffer(raw)) {
      return raw.toString('utf8');
    }
    if (Array.isArray(raw)) {
      return Buffer.concat(raw).toString('utf8');
    }
    return Buffer.from(raw).toString('utf8');
  }

  private stringValue(value: unknown): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return null;
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
