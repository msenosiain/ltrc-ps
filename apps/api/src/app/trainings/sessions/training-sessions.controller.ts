import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TrainingSessionsService } from './training-sessions.service';
import { PaginationDto } from '../../shared/pagination.dto';
import { TrainingSessionFiltersDto } from './training-session-filter.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('training-sessions')
export class TrainingSessionsController {
  constructor(private readonly sessionsService: TrainingSessionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Query() pagination: PaginationDto<TrainingSessionFiltersDto>,
    @Req() req: Request
  ) {
    return this.sessionsService.findPaginated(pagination, (req as any).user);
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  async getUpcoming(@Query('days') days?: string, @Query('today') today?: string, @Req() req?: Request) {
    return this.sessionsService.getUpcomingForUser(
      (req as any).user,
      days ? parseInt(days, 10) : 7,
      today,
    );
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateTrainingSessionDto, @Req() req: Request) {
    return this.sessionsService.create(dto, (req as any).user);
  }

  @Get('stats/attendance')
  @UseGuards(JwtAuthGuard)
  async getAttendanceStats(
    @Req() req: Request,
    @Query('sport') sport?: string,
    @Query('category') category?: string,
  ) {
    return this.sessionsService.getAttendanceStats((req as any).user, { sport, category });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTrainingSessionDto, @Req() req: Request) {
    return this.sessionsService.update(id, dto, (req as any).user);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmAttendance(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return this.sessionsService.confirmAttendance(id, (req as any).user);
  }

  @Delete(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async cancelConfirmation(@Param('id') id: string, @Req() req: Request) {
    return this.sessionsService.cancelConfirmation(id, (req as any).user);
  }

  @Get(':id/staff-options')
  @UseGuards(JwtAuthGuard)
  async getStaffForSession(@Param('id') id: string) {
    return this.sessionsService.getStaffForSession(id);
  }

  @Patch(':id/attendance')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async recordAttendance(
    @Param('id') id: string,
    @Body() dto: RecordAttendanceDto,
    @Req() req: Request
  ) {
    return this.sessionsService.recordAttendance(id, dto, (req as any).user.id);
  }
}
