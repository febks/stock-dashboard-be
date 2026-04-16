import { Module } from '@nestjs/common';
import { HoldingsModule } from '../holdings/holding.module';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';

@Module({
  imports: [HoldingsModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
