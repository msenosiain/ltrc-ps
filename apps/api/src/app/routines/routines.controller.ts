import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineFilterDto } from './dto/routine-filter.dto';
import { PaginationDto } from '../shared/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(@Query() pagination: PaginationDto<RoutineFilterDto>) {
    return this.routinesService.findPaginated(pagination);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyRoutines(@Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.routinesService.findMyRoutines(userId);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  findTodayRoutine(@Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.routinesService.findTodayRoutine(userId);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateRoutineDto, @Req() req: Request) {
    const callerId = (req as any).user?._id?.toString();
    return this.routinesService.create(dto, callerId);
  }

  @Post(':id/clone')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  clone(@Param('id') id: string, @Req() req: Request) {
    const callerId = (req as any).user?._id?.toString();
    return this.routinesService.clone(id, callerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.routinesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
    @Req() req: Request,
  ) {
    const callerId = (req as any).user?._id?.toString();
    return this.routinesService.update(id, dto, callerId);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.routinesService.delete(id);
  }
}
