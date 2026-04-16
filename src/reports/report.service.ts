import { Injectable } from '@nestjs/common';
import { HoldingsService } from '../holdings/holding.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private holdingsService: HoldingsService) {}

  async generatePDF(userId: string): Promise<Buffer> {
    // findAll already enriches holdings with currentPrice, currentValue, pnl, etc.
    const holdings = await this.holdingsService.findAll(userId);

    const fmtIDR = (n: number) =>
      'IDR ' + Math.round(n).toLocaleString('id-ID');

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Portfolio Report', { align: 'center' });
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666')
        .text(`Generated: ${new Date().toLocaleDateString()}`, {
          align: 'center',
        });
      doc.moveDown(2);

      // Table header
      const cols = {
        ticker: 50,
        name: 150,
        lots: 300,
        avgBuy: 355,
        current: 430,
        pnl: 500,
      };
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
      doc
        .text('TICKER', cols.ticker)
        .text('NAME', cols.name, doc.y - 12)
        .text('LOT', cols.lots, doc.y - 12)
        .text('AVG BUY', cols.avgBuy, doc.y - 12)
        .text('PRICE', cols.current, doc.y - 12)
        .text('P&L', cols.pnl, doc.y - 12);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.3);

      // Rows
      doc.font('Helvetica').fontSize(9);

      for (const h of holdings) {
        const pnl = h.pnl ?? 0;
        doc.fillColor(pnl >= 0 ? '#000' : '#cc0000');
        const y = doc.y;
        doc
          .text(h.ticker, cols.ticker, y)
          .text(h.name.slice(0, 18), cols.name, y)
          .text(String(h.lots), cols.lots, y)
          .text(fmtIDR(h.avgCost), cols.avgBuy, y)
          .text(fmtIDR(h.currentPrice), cols.current, y)
          .text(`${pnl >= 0 ? '+' : ''}${fmtIDR(pnl)}`, cols.pnl, y);
        doc.moveDown(0.8);
      }

      // Summary
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);
      const totalValue = holdings.reduce(
        (s, h) => s + (h.currentValue ?? 0),
        0,
      );
      const totalPnl = holdings.reduce((s, h) => s + (h.pnl ?? 0), 0);
      const totalCost = totalValue - totalPnl;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000')
        .text(`Total Portfolio Value: ${fmtIDR(totalValue)}`, {
          align: 'right',
        });
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(totalPnl >= 0 ? 'green' : 'red')
        .text(
          `Total P&L: ${totalPnl >= 0 ? '+' : ''}${fmtIDR(totalPnl)} (${totalCost > 0 ? ((totalPnl / totalCost) * 100).toFixed(2) : '0.00'}%)`,
          { align: 'right' },
        );

      doc.end();
    });
  }
}
