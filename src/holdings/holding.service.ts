import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holding } from './holding.entity';
import { StocksService } from '@/stocks/stock.service';

@Injectable()
export class HoldingsService {
  constructor(
    @InjectRepository(Holding) private repo: Repository<Holding>,
    private stocks: StocksService,
  ) {}

  async findAll(userId: string) {
    const holdings = await this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (holdings.length === 0) return [];

    const symbols = holdings.map((h) => ({
      ticker: h.ticker,
      exchange: h.exchange,
    }));
    const prices = await this.stocks.getPrices(symbols);

    // TypeORM returns decimal columns as strings — coerce to number
    // 1 lot = 100 shares (IDX convention)
    const enriched = holdings.map((h) => {
      const lots = Number(h.lots);
      const avgCost = Number(h.avgBuyPrice);
      const currentPrice = prices[h.ticker] ?? 0;
      const currentValue = lots * 100 * currentPrice;
      const cost = lots * 100 * avgCost;
      const pnl = currentValue - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

      return {
        ...h,
        lots,
        avgCost,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
        allocation: 0,
      };
    });

    const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
    enriched.forEach((h) => {
      h.allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
    });

    return enriched;
  }

  async create(userId: string, dto: Partial<Holding>) {
    const holding = this.repo.create({ ...dto, user: { id: userId } });
    return this.repo.save(holding);
  }

  async update(id: string, userId: string, dto: Partial<Holding>) {
    const holding = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!holding) throw new NotFoundException();
    if (holding.user.id !== userId) throw new ForbiddenException();
    Object.assign(holding, dto);
    return this.repo.save(holding);
  }

  async remove(id: string, userId: string) {
    const holding = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!holding) throw new NotFoundException();
    if (holding.user.id !== userId) throw new ForbiddenException();
    await this.repo.remove(holding);
  }
}
