import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { HoldingsModule } from './holdings/holding.module';
import { StocksModule } from './stocks/stock.module';
import { ReportsModule } from './reports/report.module';
import { User } from './users/user.entity';
import { Holding } from './holdings/holding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [User, Holding],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    HoldingsModule,
    StocksModule,
    ReportsModule,
  ],
})
export class AppModule {}
