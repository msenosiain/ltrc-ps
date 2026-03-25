import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkoutLogEntity } from './schemas/workout-log.entity';
import { RoutineEntity } from '../routines/schemas/routine.entity';
import { PlayerEntity } from '../players/schemas/player.entity';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { UpdateWorkoutLogDto } from './dto/update-workout-log.dto';
import { WorkoutLogFilterDto } from './dto/workout-log-filter.dto';

@Injectable()
export class WorkoutLogsService {
  constructor(
    @InjectModel(WorkoutLogEntity.name)
    private readonly logModel: Model<WorkoutLogEntity>,
    @InjectModel(RoutineEntity.name)
    private readonly routineModel: Model<RoutineEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
  ) {}

  async findPaginated(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
    filters?: WorkoutLogFilterDto;
  }) {
    const page = query.page ?? 1;
    const size = query.size ?? 25;
    const skip = (page - 1) * size;
    const filters = query.filters ?? {};
    const q: Record<string, unknown> = {};

    if (filters.playerId) q['player'] = new Types.ObjectId(filters.playerId);
    if (filters.routineId) q['routine'] = new Types.ObjectId(filters.routineId);
    if (filters.status) q['status'] = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      q['date'] = {};
      if (filters.dateFrom) (q['date'] as any)['$gte'] = filters.dateFrom;
      if (filters.dateTo) (q['date'] as any)['$lte'] = filters.dateTo;
    }

    const sort: Record<string, 1 | -1> = { date: -1 };

    const [items, total] = await Promise.all([
      this.logModel
        .find(q)
        .sort(sort)
        .skip(skip)
        .limit(size)
        .populate('routine', 'name')
        .populate('player', 'name')
        .exec(),
      this.logModel.countDocuments(q),
    ]);

    return { items, total, page, size };
  }

  async findMy(userId: string) {
    const player = await this.playerModel.findOne({ userId }).exec();
    if (!player) return [];
    return this.logModel
      .find({ player: player._id })
      .sort({ date: -1 })
      .populate('routine', 'name')
      .exec();
  }

  async findOne(id: string) {
    const log = await this.logModel
      .findById(id)
      .populate('routine', 'name')
      .populate('player', 'name')
      .exec();
    if (!log) throw new NotFoundException('WorkoutLog not found');
    return log;
  }

  async create(dto: CreateWorkoutLogDto, userId: string) {
    const player = await this.playerModel.findOne({ userId }).exec();
    if (!player) throw new ForbiddenException('No player profile linked to this account');

    const routine = await this.routineModel
      .findById(dto.routineId)
      .populate('blocks.exercises.exercise')
      .exec();
    if (!routine) throw new NotFoundException('Routine not found');

    const today = new Date().toISOString().slice(0, 10);

    const blocks = (routine.blocks ?? [])
      .sort((a, b) => a.order - b.order)
      .map((block) => ({
        blockTitle: block.title,
        blockOrder: block.order,
        exercises: (block.exercises ?? [])
          .sort((a, b) => a.order - b.order)
          .map((entry) => {
            const ex = entry.exercise as any;
            return {
              exerciseId: ex._id ?? ex.id ?? entry.exercise,
              exerciseName: ex.name ?? '',
              order: entry.order,
              sets: (entry.sets ?? []).map((s: any) => ({
                plannedReps: s.reps,
                plannedDuration: s.duration,
                plannedLoad: s.load,
                completed: false,
              })),
            };
          }),
      }));

    return this.logModel.create({
      routine: routine._id,
      player: player._id,
      date: dto.date ?? today,
      status: 'in_progress',
      blocks,
    });
  }

  async update(id: string, dto: UpdateWorkoutLogDto, userId: string) {
    const log = await this.logModel.findById(id).exec();
    if (!log) throw new NotFoundException('WorkoutLog not found');
    const player = await this.playerModel.findOne({ userId }).exec();
    if (!player || !(player._id as Types.ObjectId).equals(log.player as Types.ObjectId)) {
      throw new ForbiddenException('You can only update your own workout logs');
    }
    Object.assign(log, dto);
    return log.save();
  }

  async adminUpdate(id: string, dto: UpdateWorkoutLogDto) {
    const log = await this.logModel.findById(id).exec();
    if (!log) throw new NotFoundException('WorkoutLog not found');
    Object.assign(log, dto);
    return log.save();
  }

  async delete(id: string) {
    const log = await this.logModel.findById(id).exec();
    if (!log) throw new NotFoundException('WorkoutLog not found');
    await log.deleteOne();
  }
}
