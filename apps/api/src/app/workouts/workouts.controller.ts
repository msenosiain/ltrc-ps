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
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutFilterDto } from './dto/workout-filter.dto';
import { PaginationDto } from '../shared/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(@Query() pagination: PaginationDto<WorkoutFilterDto>) {
    return this.workoutsService.findPaginated(pagination);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyWorkouts(@Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.workoutsService.findMyWorkouts(userId);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  findTodayWorkout(@Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.workoutsService.findTodayWorkout(userId);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateWorkoutDto, @Req() req: Request) {
    const callerId = (req as any).user?._id?.toString();
    return this.workoutsService.create(dto, callerId);
  }

  @Post(':id/clone')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  clone(@Param('id') id: string, @Req() req: Request) {
    const callerId = (req as any).user?._id?.toString();
    return this.workoutsService.clone(id, callerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.workoutsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutDto,
    @Req() req: Request,
  ) {
    const callerId = (req as any).user?._id?.toString();
    return this.workoutsService.update(id, dto, callerId);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.workoutsService.delete(id);
  }
}
