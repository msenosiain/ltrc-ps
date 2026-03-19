import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingScheduleEntity } from './schemas/training-schedule.entity';
import { PaginationDto } from '../../shared/pagination.dto';
import { TrainingScheduleFiltersDto } from './training-schedule-filter.dto';
import {
  DayOfWeekEnum,
  PaginatedResponse,
  RoleEnum,
  UpcomingTraining,
} from '@ltrc-ps/shared-api-model';
import { CreateTrainingScheduleDto } from './dto/create-training-schedule.dto';
import { UpdateTrainingScheduleDto } from './dto/update-training-schedule.dto';
import { User } from '../../users/schemas/user.schema';
import { TrainingSessionEntity } from '../sessions/schemas/training-session.entity';

function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DAY_INDEX: Record<DayOfWeekEnum, number> = {
  [DayOfWeekEnum.SUNDAY]: 0,
  [DayOfWeekEnum.MONDAY]: 1,
  [DayOfWeekEnum.TUESDAY]: 2,
  [DayOfWeekEnum.WEDNESDAY]: 3,
  [DayOfWeekEnum.THURSDAY]: 4,
  [DayOfWeekEnum.FRIDAY]: 5,
  [DayOfWeekEnum.SATURDAY]: 6,
};

@Injectable()
export class TrainingSchedulesService {
  constructor(
    @InjectModel(TrainingScheduleEntity.name)
    private readonly scheduleModel: Model<TrainingScheduleEntity>,
    @InjectModel(TrainingSessionEntity.name)
    private readonly sessionModel: Model<TrainingSessionEntity>
  ) {}

  async create(dto: CreateTrainingScheduleDto, caller?: User) {
    const callerId = caller ? (caller as any)._id : undefined;
    return this.scheduleModel.create({ ...(dto as any), createdBy: callerId, updatedBy: callerId });
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
    return schedule.save();
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

  async getUpcoming(
    from: string,
    to: string,
    caller?: User,
    filters?: { sport?: string; category?: string }
  ): Promise<UpcomingTraining[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const query: Record<string, unknown> = { isActive: true };

    if (filters?.sport) query['sport'] = filters.sport;
    if (filters?.category) query['category'] = filters.category;

    if (caller && !caller.roles?.includes(RoleEnum.ADMIN)) {
      if (caller.sports?.length) query['sport'] = { $in: caller.sports };
      if (caller.categories?.length)
        query['category'] = { $in: caller.categories };
    }

    // Also respect validFrom/validUntil
    query['$or'] = [
      { validFrom: { $exists: false } },
      { validFrom: null },
      { validFrom: { $lte: toDate } },
    ];

    const schedules = await this.scheduleModel.find(query).exec();

    // Generate virtual sessions from schedules
    const upcoming: UpcomingTraining[] = [];

    for (const schedule of schedules) {
      const validUntil = schedule.validUntil;

      for (const slot of schedule.timeSlots) {
        const dayIdx = DAY_INDEX[slot.day];
        const current = new Date(fromDate);

        while (current <= toDate) {
          if (current.getDay() === dayIdx) {
            if (validUntil && current > validUntil) break;

            upcoming.push({
              scheduleId: schedule.id,
              date: toLocalDateString(current),
              startTime: slot.startTime,
              endTime: slot.endTime,
              sport: schedule.sport,
              category: schedule.category,
              division: schedule.division,
              location: slot.location,
              confirmations: 0,
            });
          }
          current.setDate(current.getDate() + 1);
        }
      }
    }

    // Find existing materialized sessions in range
    const existingSessions = await this.sessionModel
      .find({
        date: { $gte: fromDate, $lte: toDate },
        schedule: { $in: schedules.map((s) => s._id) },
      })
      .exec();

    // Merge: attach sessionId and confirmation count to virtual sessions
    for (const session of existingSessions) {
      const scheduleId =
        typeof session.schedule === 'object'
          ? (session.schedule as any)?._id?.toHexString?.() ??
            String(session.schedule)
          : String(session.schedule);
      const sessionDate = toLocalDateString(session.date);

      const match = upcoming.find(
        (u) =>
          u.scheduleId === scheduleId &&
          u.date === sessionDate &&
          u.startTime === session.startTime
      );
      if (match) {
        match.sessionId = session.id;
        match.confirmations = session.attendance.filter(
          (a) => a.confirmed
        ).length;
      }
    }

    // Sort by date then startTime
    upcoming.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      return dateDiff !== 0 ? dateDiff : a.startTime.localeCompare(b.startTime);
    });

    return upcoming;
  }
}
