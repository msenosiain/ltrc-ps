import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkoutEntity } from './schemas/workout.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutFilterDto } from './dto/workout-filter.dto';
import { PaginatedResponse, WorkoutStatusEnum } from '@ltrc-campo/shared-api-model';
import { PaginationDto } from '../shared/pagination.dto';
import { PlayerEntity } from '../players/schemas/player.entity';

const POPULATE_BLOCKS = 'blocks.exercises.exercise';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectModel(WorkoutEntity.name)
    private readonly workoutModel: Model<WorkoutEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
  ) {}

  async findPaginated(
    pagination: PaginationDto<WorkoutFilterDto>,
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;
    const query: Record<string, unknown> = {};

    if (filters.searchTerm) {
      query['name'] = new RegExp(filters.searchTerm, 'i');
    }
    if (filters.sport) query['sport'] = filters.sport;
    if (filters.category) query['category'] = filters.category;
    if (filters.status) query['status'] = filters.status;
    if (filters.playerId) query['assignedPlayers'] = filters.playerId;

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { name: 1 };

    const [items, total] = await Promise.all([
      this.workoutModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(size)
        .populate(POPULATE_BLOCKS)
        .exec(),
      this.workoutModel.countDocuments(query),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const workout = await this.workoutModel.findById(id).populate(POPULATE_BLOCKS);
    if (!workout) throw new NotFoundException('Workout not found');
    return workout;
  }

  async findMyWorkouts(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const player = await this.playerModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!player) return [];

    const p = player as any;

    return this.workoutModel
      .find({
        status: WorkoutStatusEnum.ACTIVE,
        validFrom: { $lte: today },
        validUntil: { $gte: today },
        $or: [
          { assignedPlayers: player._id },
          {
            assignedPlayers: { $size: 0 },
            $and: [
              { $or: [{ sport: { $exists: false } }, { sport: null }, { sport: '' }, { sport: p.sport }] },
              { $or: [{ category: { $exists: false } }, { category: null }, { category: '' }, { category: p.category }] },
              {
                $or: [
                  { targetPositions: { $size: 0 } },
                  { targetPositions: { $exists: false } },
                  { targetPositions: { $in: p.positions ?? [] } },
                ],
              },
            ],
          },
        ],
      })
      .populate(POPULATE_BLOCKS)
      .sort({ name: 1 })
      .exec();
  }

  async create(dto: CreateWorkoutDto, callerId?: string) {
    return this.workoutModel.create({
      ...dto,
      createdBy: callerId,
      updatedBy: callerId,
    });
  }

  async update(id: string, dto: UpdateWorkoutDto, callerId?: string) {
    const workout = await this.workoutModel.findById(id);
    if (!workout) throw new NotFoundException('Workout not found');
    Object.assign(workout, dto);
    if (callerId) (workout as any).updatedBy = callerId;
    return workout.save();
  }

  async delete(id: string) {
    const workout = await this.workoutModel.findById(id);
    if (!workout) throw new NotFoundException('Workout not found');
    return workout.deleteOne();
  }

  async clone(id: string, callerId?: string) {
    const original = await this.workoutModel.findById(id).lean();
    if (!original) throw new NotFoundException('Workout not found');
    const { _id, __v, createdAt, updatedAt, ...rest } = original as any;
    return this.workoutModel.create({
      ...rest,
      name: `Copia de ${rest.name}`,
      status: WorkoutStatusEnum.DRAFT,
      createdBy: callerId,
      updatedBy: callerId,
    });
  }

  async findTodayWorkout(userId: string) {
    const today = new Date().toISOString().slice(0, 10);

    const player = await this.playerModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!player) return null;

    const p = player as any;

    const workout = await this.workoutModel
      .findOne({
        status: WorkoutStatusEnum.ACTIVE,
        validFrom: { $lte: today },
        validUntil: { $gte: today },
        $or: [
          // Asignación explícita por jugador
          { assignedPlayers: player._id },
          // Sin asignación explícita: matchear por sport/category/posición del jugador
          {
            assignedPlayers: { $size: 0 },
            $and: [
              { $or: [{ sport: { $exists: false } }, { sport: null }, { sport: '' }, { sport: p.sport }] },
              { $or: [{ category: { $exists: false } }, { category: null }, { category: '' }, { category: p.category }] },
              {
                $or: [
                  { targetPositions: { $size: 0 } },
                  { targetPositions: { $exists: false } },
                  { targetPositions: { $in: p.positions ?? [] } },
                ],
              },
            ],
          },
        ],
      })
      .populate('blocks.exercises.exercise')
      .exec();

    return workout ?? null;
  }
}
