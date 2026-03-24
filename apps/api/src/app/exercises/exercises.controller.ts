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
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFilterDto } from './dto/exercise-filter.dto';
import { PaginationDto } from '../shared/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(@Query() pagination: PaginationDto<ExerciseFilterDto>) {
    return this.exercisesService.findPaginated(pagination);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateExerciseDto, @Req() req: Request) {
    const callerId = (req as any).user?._id?.toString();
    return this.exercisesService.create(dto, callerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
    @Req() req: Request,
  ) {
    const callerId = (req as any).user?._id?.toString();
    return this.exercisesService.update(id, dto, callerId);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.exercisesService.delete(id);
  }
}
