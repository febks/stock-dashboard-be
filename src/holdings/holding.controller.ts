import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { HoldingsService } from './holding.service';

class CreateHoldingDto {
  @IsString() ticker!: string;
  @IsString() name!: string;
  @IsNumber() @Min(0) lots!: number;
  @IsNumber() @Min(0) avgBuyPrice!: number;
  @IsString() @IsOptional() exchange?: string;
  @IsDateString() @IsOptional() buyDate?: string;
}

@Controller('holdings')
@UseGuards(AuthGuard('jwt'))
export class HoldingsController {
  constructor(private service: HoldingsService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateHoldingDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateHoldingDto>,
  ) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
