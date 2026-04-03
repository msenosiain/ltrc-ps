import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';

@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getEvents(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('sport') sport: string | undefined,
    @Query('category') category: string | undefined,
    @Req() req: Request,
  ) {
    return this.calendarService.getEvents(fromDate, toDate, (req as any).user, sport, category);
  }
}
