import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListItemEntity } from './entities/shopping-list-item.entity';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingListWsServer } from './shopping-list.ws';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingListItemEntity])],
  providers: [ShoppingListService, ShoppingListWsServer],
})
export class ShoppingListModule {}
