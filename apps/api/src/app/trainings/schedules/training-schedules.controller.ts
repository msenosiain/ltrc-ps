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
import { TrainingSchedulesService } from './training-schedules.service';
import { PaginationDto } from '../../shared/pagination.dto';
import { TrainingScheduleFiltersDto } from './training-schedule-filter.dto';
import { CreateTrainingScheduleDto } from './dto/create-training-schedule.dto';
import { UpdateTrainingScheduleDto } from './dto/update-training-schedule.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('training-schedules')
export class TrainingSchedulesController {
  constructor(private readonly schedulesService: TrainingSchedulesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Query() pagination: PaginationDto<TrainingScheduleFiltersDto>,
    @Req() req: Request
  ) {
    return this.schedulesService.findPaginated(pagination, (req as any).user);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateTrainingScheduleDto, @Req() req: Request) {
    return this.schedulesService.create(dto, (req as any).user);
  }

  @Post(':id/duplicate')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async duplicate(@Param('id') id: string, @Req() req: Request) {
    return this.schedulesService.duplicate(id, (req as any).user);
  }

  @Get('field-options')
  async getFieldOptions() {
    return this.schedulesService.getFieldOptions();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTrainingScheduleDto,
    @Req() req: Request
  ) {
    return this.schedulesService.update(id, dto, (req as any).user);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.schedulesService.delete(id);
  }
}
