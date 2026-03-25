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
import { WorkoutLogsService } from './workout-logs.service';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('workout-logs')
export class WorkoutLogsController {
  constructor(private readonly workoutLogsService: WorkoutLogsService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findPaginated(@Query() query: any) {
    return this.workoutLogsService.findPaginated(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.workoutLogsService.findMy(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateWorkoutLogDto, @Req() req: Request) {
    const userId = (req as any).user?._id?.toString();
    return this.workoutLogsService.create(dto, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.workoutLogsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutLogDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?._id?.toString();
    const roles: string[] = (req as any).user?.roles ?? [];
    const isPrivileged = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER].some((r) =>
      roles.includes(r)
    );
    if (isPrivileged) return this.workoutLogsService.adminUpdate(id, dto);
    return this.workoutLogsService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  delete(@Param('id') id: string) {
    return this.workoutLogsService.delete(id);
  }
}
