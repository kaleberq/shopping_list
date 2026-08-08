import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddListItemUseCase } from '../application/port/in/add-list-item.use-case';
import { GetListItemsUseCase } from '../application/port/in/get-list-items.use-case';
import { ShoppingListRepository } from '../application/port/out/shopping-list.repository';
import { AddListItemUseCaseImpl } from '../application/usecase/add-list-item.use-case.impl';
import { GetListItemsUseCaseImpl } from '../application/usecase/get-list-items.use-case.impl';
import { ShoppingListWsServer } from './adapter/in/websocket/shopping-list.ws';
import { ShoppingListItemOrmEntity } from './adapter/out/persistence/shopping-list-item.orm-entity';
import { TypeOrmShoppingListRepository } from './adapter/out/persistence/typeorm-shopping-list.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingListItemOrmEntity])],
  providers: [
    {
      provide: ShoppingListRepository,
      useClass: TypeOrmShoppingListRepository,
    },
    { provide: AddListItemUseCase, useClass: AddListItemUseCaseImpl },
    { provide: GetListItemsUseCase, useClass: GetListItemsUseCaseImpl },
    ShoppingListWsServer,
  ],
})
export class ShoppingListModule {}
