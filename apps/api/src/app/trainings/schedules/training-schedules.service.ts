import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingScheduleEntity } from './schemas/training-schedule.entity';
import { PaginationDto } from '../../shared/pagination.dto';
import { TrainingScheduleFiltersDto } from './training-schedule-filter.dto';
import {
  PaginatedResponse,
  RoleEnum,
} from '@ltrc-campo/shared-api-model';
import { CreateTrainingScheduleDto } from './dto/create-training-schedule.dto';
import { UpdateTrainingScheduleDto } from './dto/update-training-schedule.dto';
import { User } from '../../users/schemas/user.schema';
import { TrainingSessionsService } from '../sessions/training-sessions.service';

@Injectable()
export class TrainingSchedulesService {
  constructor(
    @InjectModel(TrainingScheduleEntity.name)
    private readonly scheduleModel: Model<TrainingScheduleEntity>,
    private readonly sessionsService: TrainingSessionsService,
  ) {}

  async create(dto: CreateTrainingScheduleDto, caller?: User) {
    const callerId = caller ? (caller as any)._id : undefined;
    const schedule = await this.scheduleModel.create({ ...(dto as any), createdBy: callerId, updatedBy: callerId });
    // Generate sessions for the next 60 days after creation
    await this.sessionsService.generateForSchedule(schedule.id);
    return schedule;
  }

  async findPaginated(
    pagination: PaginationDto<TrainingScheduleFiltersDto>,
    caller?: User
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters: Record<string, unknown> = {};

    if (filters.sport) queryFilters['sport'] = filters.sport;
    if (filters.category) queryFilters['category'] = filters.category;
    if (filters.isActive !== undefined)
      queryFilters['isActive'] = filters.isActive;

    if (caller && !caller.roles?.includes(RoleEnum.ADMIN)) {
      if (caller.sports?.length) queryFilters['sport'] = { $in: caller.sports };
      if (caller.categories?.length)
        queryFilters['category'] = { $in: caller.categories };
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['sport'] = 1;
    }

    const [items, total] = await Promise.all([
      this.scheduleModel
        .find(queryFilters)
        .skip(skip)
        .limit(size)
        .sort(sort)
        .exec(),
      this.scheduleModel.countDocuments(queryFilters).exec(),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException('Training schedule not found');
    return schedule;
  }

  async update(id: string, dto: UpdateTrainingScheduleDto, caller?: User) {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException('Training schedule not found');
    Object.assign(schedule, dto);
    if (caller) schedule.updatedBy = (caller as any)._id;
    const saved = await schedule.save();
    // Regenerate future sessions from today onwards
    const today = new Date().toISOString().slice(0, 10);
    await this.sessionsService.generateForSchedule(saved.id, today);
    return saved;
  }

  async delete(id: string) {
    const schedule = await this.scheduleModel.findById(id);
    if (!schedule) throw new NotFoundException('Training schedule not found');
    return schedule.deleteOne();
  }

  async getFieldOptions() {
    const locations = await this.scheduleModel
      .distinct('timeSlots.location')
      .then((vals) => vals.filter(Boolean));
    return { locations };
  }
}
