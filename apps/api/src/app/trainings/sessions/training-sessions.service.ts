import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingSessionEntity } from './schemas/training-session.entity';
import { TrainingScheduleEntity } from '../schedules/schemas/training-schedule.entity';
import { PaginationDto } from '../../shared/pagination.dto';
import { TrainingSessionFiltersDto } from './training-session-filter.dto';
import {
  PaginatedResponse,
  RoleEnum,
  TrainingSessionStatusEnum,
  UpcomingTraining,
  DayOfWeekEnum,
} from '@ltrc-campo/shared-api-model';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { User } from '../../users/schemas/user.schema';
import { PlayerEntity } from '../../players/schemas/player.entity';

const STAFF_ROLES: RoleEnum[] = [RoleEnum.COACH, RoleEnum.TRAINER, RoleEnum.MANAGER, RoleEnum.ANALYST];

const POPULATE_FIELDS = ['schedule', { path: 'attendance.player' }];

export const DAY_INDEX: Record<DayOfWeekEnum, number> = {
  [DayOfWeekEnum.SUNDAY]: 0,
  [DayOfWeekEnum.MONDAY]: 1,
  [DayOfWeekEnum.TUESDAY]: 2,
  [DayOfWeekEnum.WEDNESDAY]: 3,
  [DayOfWeekEnum.THURSDAY]: 4,
  [DayOfWeekEnum.FRIDAY]: 5,
  [DayOfWeekEnum.SATURDAY]: 6,
};

export function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class TrainingSessionsService {
  constructor(
    @InjectModel(TrainingSessionEntity.name)
    private readonly sessionModel: Model<TrainingSessionEntity>,
    @InjectModel(TrainingScheduleEntity.name)
    private readonly scheduleModel: Model<TrainingScheduleEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  async create(dto: CreateTrainingSessionDto, caller?: User) {
    const callerId = caller ? (caller as any)._id : undefined;
    return this.sessionModel.create({ ...(dto as any), createdBy: callerId, updatedBy: callerId });
  }

  async findPaginated(
    pagination: PaginationDto<TrainingSessionFiltersDto>,
    caller?: User
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters: Record<string, unknown> = {};

    if (filters.sport) queryFilters['sport'] = filters.sport;
    if (filters.category) queryFilters['category'] = filters.category;
    if (filters.status) queryFilters['status'] = filters.status;

    if (filters.fromDate || filters.toDate) {
      const dateFilter: Record<string, string> = {};
      if (filters.fromDate) dateFilter['$gte'] = filters.fromDate;
      if (filters.toDate) dateFilter['$lte'] = filters.toDate;
      queryFilters['date'] = dateFilter;
    }

    if (caller && !caller.roles?.includes(RoleEnum.ADMIN)) {
      let sports = caller.sports ?? [];
      let categories = caller.categories ?? [];

      // Fall back to linked player's sport/category
      if (!sports.length || !categories.length) {
        const player = await this.playerModel
          .findOne({ userId: String(caller._id) })
          .exec();
        if (!sports.length && player?.sport) sports = [player.sport];
        if (!categories.length && player?.category)
          categories = [player.category];
      }

      if (sports.length) queryFilters['sport'] = { $in: sports };
      if (categories.length) queryFilters['category'] = { $in: categories };
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['date'] = 1;
    }
    sort['startTime'] = 1;

    const [items, total] = await Promise.all([
      this.sessionModel
        .find(queryFilters)
        .skip(skip)
        .limit(size)
        .sort(sort)
        .populate(POPULATE_FIELDS)
        .exec(),
      this.sessionModel.countDocuments(queryFilters).exec(),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const session = await this.sessionModel
      .findById(id)
      .populate(POPULATE_FIELDS);
    if (!session) throw new NotFoundException('Training session not found');
    return session;
  }

  async update(id: string, dto: UpdateTrainingSessionDto, caller?: User) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Training session not found');
    Object.assign(session, dto);
    if (caller) session.updatedBy = (caller as any)._id;
    return session.save();
  }

  async delete(id: string) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Training session not found');
    // Soft-delete: mark as CANCELLED so the scheduler doesn't recreate it on restart
    if (session.schedule) {
      session.status = TrainingSessionStatusEnum.CANCELLED;
      return session.save();
    }
    return session.deleteOne();
  }

  /**
   * Get upcoming sessions for the current user.
   * All sessions come from the DB (pre-generated by the scheduler).
   */
  async getUpcomingForUser(
    caller: User,
    days = 7,
    todayStr?: string,
  ): Promise<UpcomingTraining[]> {
    const from = todayStr ?? new Date().toISOString().slice(0, 10);
    const toDate = new Date(from + 'T12:00:00Z');
    toDate.setDate(toDate.getDate() + days);
    const to = toDate.toISOString().slice(0, 10);

    // Find player linked to user (if any — for filtering & self-confirmation)
    const player = await this.playerModel
      .findOne({ userId: String(caller._id) })
      .exec();

    const userId = String(caller._id);

    const scopeFilter: Record<string, unknown> = {};

    if (!caller.roles?.includes(RoleEnum.ADMIN)) {
      // Resolve sports/categories: prefer user-level, fall back to linked player
      const sports = caller.sports?.length
        ? caller.sports
        : player?.sport
          ? [player.sport]
          : [];
      const categories = caller.categories?.length
        ? caller.categories
        : player?.category
          ? [player.category]
          : [];

      if (sports.length) scopeFilter['sport'] = { $in: sports };
      if (categories.length) scopeFilter['category'] = { $in: categories };
    }

    const sessions = await this.sessionModel.find({
      date: { $gte: from, $lte: to },
      status: { $ne: TrainingSessionStatusEnum.CANCELLED },
      ...scopeFilter,
    }).sort({ date: 1, startTime: 1 }).exec();

    return sessions.map(session => ({
      sessionId: session.id,
      date: session.date as unknown as string,
      startTime: session.startTime,
      endTime: session.endTime,
      sport: session.sport,
      category: session.category,
      division: session.division,
      location: session.location,
      status: session.status,
      confirmations: session.attendance.filter(a => a.confirmed).length,
      confirmed: session.attendance.some(a => a.confirmed && (
        (player && a.player?.toString() === player._id.toString()) ||
        a.user === userId
      )),
    }));
  }

  /**
   * Generate sessions for a schedule and persist to DB.
   * Idempotent via upsert. Used by the scheduler cron and on schedule create/update.
   */
  async generateForSchedule(scheduleId: string, fromDateStr?: string, toDateStr?: string) {
    const schedule = await this.scheduleModel.findById(scheduleId);
    if (!schedule || !schedule.isActive) return;

    const from = fromDateStr ?? new Date().toISOString().slice(0, 10);
    const toDate = new Date((toDateStr ?? from) + 'T12:00:00Z');
    if (!toDateStr) toDate.setDate(toDate.getDate() + 30);
    const to = toDate.toISOString().slice(0, 10);

    for (const slot of schedule.timeSlots) {
      let current = from;
      while (current <= to) {
        const d = new Date(current + 'T12:00:00Z');
        if (DAY_INDEX[slot.day] === d.getUTCDay()) {
          // Check validFrom/validUntil using string comparison
          if (schedule.validUntil && current > schedule.validUntil) break;
          if (schedule.validFrom && current < schedule.validFrom) {
            current = nextDay(current);
            continue;
          }
          await this.sessionModel.findOneAndUpdate(
            { schedule: schedule._id, date: current },
            {
              $setOnInsert: {
                startTime: slot.startTime,
                endTime: slot.endTime,
                sport: schedule.sport,
                category: schedule.category,
                division: schedule.division,
                location: slot.location,
                status: TrainingSessionStatusEnum.SCHEDULED,
                attendance: [],
              },
            },
            { upsert: true, returnDocument: 'after' }
          );
        }
        current = nextDay(current);
      }
    }

    // Update generatedUntil watermark
    await this.scheduleModel.findByIdAndUpdate(scheduleId, { generatedUntil: to });
  }

  /**
   * Player/staff confirms attendance.
   */
  async confirmAttendance(sessionId: string, caller: User) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Training session not found');

    // Only field roles can confirm attendance
    const fieldRoles = [RoleEnum.PLAYER, RoleEnum.COACH, RoleEnum.TRAINER, RoleEnum.MANAGER];
    const hasFieldRole = (caller.roles ?? []).some((r) => fieldRoles.includes(r as RoleEnum));
    if (!hasFieldRole) {
      throw new BadRequestException('Solo usuarios con rol de cancha pueden confirmar asistencia');
    }

    // Determine if caller is staff or player
    const player = await this.playerModel
      .findOne({ userId: String(caller._id) })
      .exec();
    const isStaff = !player;

    // Check if already confirmed
    const existing = session.attendance.find((a) => {
      if (isStaff) return a.user === String(caller._id);
      return a.player?.toString() === player!._id.toString();
    });

    if (existing) {
      existing.confirmed = true;
      existing.confirmedAt = new Date();
    } else {
      const entry: any = {
        isStaff,
        confirmed: true,
        confirmedAt: new Date(),
      };
      if (isStaff) {
        entry.user = String(caller._id);
        entry.userName = caller.name;
      } else {
        entry.player = player!._id;
      }
      session.attendance.push(entry);
    }

    await session.save();
    return session.populate(POPULATE_FIELDS);
  }

  /**
   * Cancel confirmation.
   */
  async cancelConfirmation(sessionId: string, caller: User) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Training session not found');

    const player = await this.playerModel
      .findOne({ userId: String(caller._id) })
      .exec();
    const isStaff = !player;

    const entry = session.attendance.find((a) => {
      if (isStaff) return a.user === String(caller._id);
      return a.player?.toString() === player!._id.toString();
    });

    if (entry) {
      entry.confirmed = false;
      entry.confirmedAt = undefined;
    }

    await session.save();
    return session.populate(POPULATE_FIELDS);
  }

  /**
   * Coach/PF records attendance (bulk).
   */
  async recordAttendance(
    sessionId: string,
    dto: RecordAttendanceDto,
    callerId: string
  ) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Training session not found');

    const now = new Date();

    for (const record of dto.records) {
      let existing: any;

      if (record.isStaff && record.userId) {
        existing = session.attendance.find(
          (a) => a.isStaff && a.user === record.userId
        );
        if (!existing) {
          existing = {
            user: record.userId,
            userName: record.userName,
            isStaff: true,
            confirmed: false,
          };
          session.attendance.push(existing);
          existing = session.attendance[session.attendance.length - 1];
        }
      } else if (record.playerId) {
        existing = session.attendance.find(
          (a) => !a.isStaff && a.player?.toString() === record.playerId
        );
        if (!existing) {
          existing = {
            player: record.playerId as any,
            isStaff: false,
            confirmed: false,
          };
          session.attendance.push(existing);
          existing = session.attendance[session.attendance.length - 1];
        }
      }

      if (existing) {
        if (record.status) {
          existing.status = record.status;
          existing.markedAt = now;
          existing.markedBy = callerId;
        }
        if (record.confirmed !== undefined) {
          existing.confirmed = record.confirmed;
          existing.confirmedAt = record.confirmed ? now : undefined;
        }
      }
    }

    await session.save();
    return session.populate(POPULATE_FIELDS);
  }

  /**
   * Returns staff users (coach/trainer/manager/analyst) relevant to this session's sport+category.
   */
  async getStaffForSession(sessionId: string): Promise<{ id: string; name: string; roles: string[] }[]> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Training session not found');

    const query: Record<string, any> = { roles: { $in: STAFF_ROLES } };
    // Include users with no sport/category restriction OR who match this session's sport+category
    query['$and'] = [
      {
        $or: [
          { sports: { $exists: false } },
          { sports: { $size: 0 } },
          { sports: session.sport },
        ],
      },
      {
        $or: [
          { categories: { $exists: false } },
          { categories: { $size: 0 } },
          { categories: session.category },
        ],
      },
    ];

    const users = await this.userModel.find(query).select('_id name roles').exec();
    return users.map((u) => ({ id: (u as any)._id.toString(), name: u.name, roles: u.roles ?? [] }));
  }
}
