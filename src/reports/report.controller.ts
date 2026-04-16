import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ReportsService } from './report.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('pdf')
  async downloadPDF(@Request() req, @Res() res: Response) {
    const buffer = await this.service.generatePDF(req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="portfolio-report.pdf"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
