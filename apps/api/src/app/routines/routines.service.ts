import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutineEntity } from './schemas/routine.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineFilterDto } from './dto/routine-filter.dto';
import { PaginatedResponse, RoutineStatusEnum } from '@ltrc-campo/shared-api-model';
import { PaginationDto } from '../shared/pagination.dto';
import { PlayerEntity } from '../players/schemas/player.entity';

const POPULATE_BLOCKS = 'blocks.exercises.exercise';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(RoutineEntity.name)
    private readonly routineModel: Model<RoutineEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
  ) {}

  async findPaginated(
    pagination: PaginationDto<RoutineFilterDto>,
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
      this.routineModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(size)
        .populate(POPULATE_BLOCKS)
        .exec(),
      this.routineModel.countDocuments(query),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const routine = await this.routineModel.findById(id).populate(POPULATE_BLOCKS);
    if (!routine) throw new NotFoundException('Routine not found');
    return routine;
  }

  async findMyRoutines(userId: string) {
    const today = new Date().toISOString().slice(0, 10);

    // Find the player linked to this user
    const player = await this.playerModel.findOne({ userId }).exec();
    if (!player) return [];

    return this.routineModel
      .find({
        assignedPlayers: player._id,
        validFrom: { $lte: today },
        validUntil: { $gte: today },
      })
      .populate(POPULATE_BLOCKS)
      .exec();
  }

  async create(dto: CreateRoutineDto, callerId?: string) {
    return this.routineModel.create({
      ...dto,
      createdBy: callerId,
      updatedBy: callerId,
    });
  }

  async update(id: string, dto: UpdateRoutineDto, callerId?: string) {
    const routine = await this.routineModel.findById(id);
    if (!routine) throw new NotFoundException('Routine not found');
    Object.assign(routine, dto);
    if (callerId) (routine as any).updatedBy = callerId;
    return routine.save();
  }

  async delete(id: string) {
    const routine = await this.routineModel.findById(id);
    if (!routine) throw new NotFoundException('Routine not found');
    return routine.deleteOne();
  }

  async clone(id: string, callerId?: string) {
    const original = await this.routineModel.findById(id).lean();
    if (!original) throw new NotFoundException('Routine not found');
    const { _id, __v, createdAt, updatedAt, ...rest } = original as any;
    return this.routineModel.create({
      ...rest,
      name: `Copia de ${rest.name}`,
      status: RoutineStatusEnum.DRAFT,
      createdBy: callerId,
      updatedBy: callerId,
    });
  }

  async findTodayRoutine(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[new Date().getDay()];

    const player = await this.playerModel.findOne({ userId }).exec();
    if (!player) return null;

    const routine = await this.routineModel
      .findOne({
        status: RoutineStatusEnum.ACTIVE,
        validFrom: { $lte: today },
        validUntil: { $gte: today },
        $and: [
          {
            $or: [
              { daysOfWeek: { $exists: false } },
              { daysOfWeek: { $size: 0 } },
              { daysOfWeek: todayDayName },
            ],
          },
          {
            $or: [
              { assignedPlayers: { $size: 0 } },
              { assignedPlayers: player._id },
            ],
          },
          {
            $or: [
              { assignedBranches: { $size: 0 } },
              { assignedBranches: { $exists: false } },
              { assignedBranches: (player as any).branch },
            ],
          },
        ],
      })
      .populate('blocks.exercises.exercise')
      .exec();

    return routine ?? null;
  }
}
