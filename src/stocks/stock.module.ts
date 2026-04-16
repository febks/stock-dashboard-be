import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StocksService } from './stock.service';
import { StocksController } from './stock.controller';

@Module({
  imports: [HttpModule],
  providers: [StocksService],
  controllers: [StocksController],
  exports: [StocksService],
})
export class StocksModule {}
