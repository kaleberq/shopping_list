import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EmailVerificationCode } from './auth/entities/email-verification-code.entity';
import { User } from './auth/entities/user.entity';
import { ShoppingListItemEntity } from './shopping-list/entities/shopping-list-item.entity';
import { ShoppingListModule } from './shopping-list/shopping-list.module';

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
        entities: [User, EmailVerificationCode, ShoppingListItemEntity],
        synchronize: config.get<string>('TYPEORM_SYNC', 'true') === 'true',
      }),
    }),
    AuthModule,
    ShoppingListModule,
  ],
})
export class AppModule {}
