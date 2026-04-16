import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StocksService } from './stock.service';

@Controller('stocks')
@UseGuards(AuthGuard('jwt'))
export class StocksController {
  constructor(private service: StocksService) {}

  @Get('price')
  getPrice(@Query('ticker') ticker: string) {
    return this.service.getPrice(ticker).then((price) => ({ ticker, price }));
  }

  @Get('prices')
  getPrices(@Query('tickers') tickers: string) {
    return this.service.getPrices(tickers.split(',').map((ticker) => ({ ticker })));
  }
}
