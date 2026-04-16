import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holding } from './holding.entity';
import { HoldingsService } from './holding.service';
import { HoldingsController } from './holding.controller';
import { StocksModule } from '@/stocks/stock.module';

@Module({
  imports: [TypeOrmModule.forFeature([Holding]), StocksModule],
  providers: [HoldingsService],
  controllers: [HoldingsController],
  exports: [HoldingsService],
})
export class HoldingsModule {}
