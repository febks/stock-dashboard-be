import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Maps exchange codes to Yahoo Finance ticker suffixes
const YAHOO_SUFFIX: Record<string, string> = {
  IDX: '.JK',
  SGX: '.SI',
  HKEX: '.HK',
  LSE: '.L',
  TSX: '.TO',
  ASX: '.AX',
};

@Injectable()
export class StocksService {
  private cache = new Map<string, { price: number; ts: number }>();
  private TTL = 60_000; // 1 minute cache

  constructor(private http: HttpService) {}

  private toYahooSymbol(ticker: string, exchange?: string | null): string {
    const suffix = exchange ? (YAHOO_SUFFIX[exchange.toUpperCase()] ?? '') : '';
    return `${ticker}${suffix}`;
  }

  async getPrice(ticker: string, exchange?: string | null): Promise<number> {
    const cacheKey = exchange ? `${ticker}:${exchange}` : ticker;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < this.TTL) return cached.price;

    const symbol = this.toYahooSymbol(ticker, exchange);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const { data } = await firstValueFrom(
      this.http.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
    );

    const result = data?.chart?.result?.[0];
    const price: number | undefined = result?.meta?.regularMarketPrice;

    if (!price || isNaN(price)) {
      throw new Error(`No price for ${symbol} (${cacheKey})`);
    }

    this.cache.set(cacheKey, { price, ts: Date.now() });
    return price;
  }

  async getPrices(
    symbols: { ticker: string; exchange?: string | null }[],
  ): Promise<Record<string, number>> {
    const seen = new Set<string>();
    const results: Record<string, number> = {};

    await Promise.all(
      symbols.map(async ({ ticker, exchange }) => {
        const key = exchange ? `${ticker}:${exchange}` : ticker;
        if (seen.has(key)) return;
        seen.add(key);
        try {
          results[ticker] = await this.getPrice(ticker, exchange);
        } catch (err) {
          console.error(
            `[StocksService] Failed to get price for ${key}:`,
            (err as Error).message,
          );
          results[ticker] = 0;
        }
      }),
    );
    return results;
  }
}
