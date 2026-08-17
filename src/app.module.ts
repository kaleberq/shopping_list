import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationCodeOrmEntity } from './identity/infrastructure/adapter/out/persistence/email-verification-code.orm-entity';
import { PlanOrmEntity } from './identity/infrastructure/adapter/out/persistence/plan.orm-entity';
import { UserOrmEntity } from './identity/infrastructure/adapter/out/persistence/user.orm-entity';
import { IdentityModule } from './identity/infrastructure/identity.module';
import { ShoppingListItemOrmEntity } from './shoppinglist/infrastructure/adapter/out/persistence/shopping-list-item.orm-entity';
import { ShoppingListModule } from './shoppinglist/infrastructure/shoppinglist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get<string>('DATABASE_PORT', '5432')),
        username: config.get<string>('DATABASE_USER', 'shopping_list'),
        password: config.get<string>('DATABASE_PASSWORD', 'shopping_list'),
        database: config.get<string>('DATABASE_NAME', 'shopping_list'),
        entities: [
          UserOrmEntity,
          PlanOrmEntity,
          EmailVerificationCodeOrmEntity,
          ShoppingListItemOrmEntity,
        ],
        synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
      }),
    }),
    IdentityModule,
    ShoppingListModule,
  ],
})
export class AppModule {}
