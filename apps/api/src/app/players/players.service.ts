import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlayerEntity } from './schemas/player.entity';
import { GridFsService } from '../shared/gridfs/gridfs.service';
import type { File as MulterFile } from 'multer';
import { PaginationDto } from '../shared/pagination.dto';
import {
  PaginatedResponse,
  Player,
} from '@ltrc-ps/shared-api-model';
import { PlayerFiltersDto } from './player-filter.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../auth/roles.enum';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    private readonly gridFsService: GridFsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePlayerDto, photo?: MulterFile) {
    let photoId: string | undefined;

    if (photo) {
      photoId = await this.gridFsService.uploadFile(
        'playersPhotos',
        photo.originalname,
        photo.buffer,
        photo.mimetype
      );
    }

    const player = await this.playerModel.create({
      ...dto,
      photoId,
    });

    if (dto.createUser && dto.email) {
      const existing = await this.usersService.findOneByEmail(dto.email);
      if (existing) {
        throw new ConflictException(
          `El email ${dto.email} ya está registrado como usuario`
        );
      }

      const user = await this.usersService.create({
        name: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        roles: [Role.PLAYER],
      });

      player.userId = (user as any)._id;
      await player.save();
    }

    return player;
  }

  async update(id: string, dto: Partial<CreatePlayerDto>, photo?: MulterFile) {
    const player = await this.playerModel.findById(id);
    if (!player) throw new NotFoundException('Player not found');

    if (photo) {
      // delete old
      if (player.photoId) {
        await this.gridFsService.deleteFile('playersPhotos', player.photoId);
      }
      // upload new
      player.photoId = await this.gridFsService.uploadFile(
        'playersPhotos',
        photo.originalname,
        photo.buffer,
        photo.mimetype
      );
    }

    Object.assign(player, dto);
    return player.save();
  }

  async findPaginated(
    pagination: PaginationDto<PlayerFiltersDto>
  ): Promise<PaginatedResponse<Player>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters = {};

    // searchTerm → firstName, lastName o nickName
    if (filters.searchTerm) {
      queryFilters['$or'] = [
        { firstName: { $regex: new RegExp(filters.searchTerm, 'i') } },
        { lastName: { $regex: new RegExp(filters.searchTerm, 'i') } },
        { nickName: { $regex: new RegExp(filters.searchTerm, 'i') } },
      ];
    }

    // position → position o alternatePosition
    if (filters.position) {
      queryFilters['$and'] = [
        queryFilters['$and'] || {},
        {
          $or: [
            { position: filters.position },
            { alternatePosition: filters.position },
          ],
        },
      ];
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['lastName'] = -1;
    }

    // Query a MongoDB
    const [items, total] = await Promise.all([
      this.playerModel
        .find(queryFilters)
        .skip(skip)
        .limit(size)
        .sort(sort)
        .exec(),
      this.playerModel.countDocuments(queryFilters).exec(),
    ]);

    return { items: items as unknown as Player[], total, page, size };
  }

  async findOne(id: string) {
    const player = await this.playerModel.findById(id);
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async findByUserId(userId: string): Promise<PlayerEntity | null> {
    return this.playerModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async getPhotoStream(photoId: string) {
    return this.gridFsService.getFileStream('playersPhotos', photoId);
  }

  async delete(id: string) {
    const player = await this.playerModel.findById(id);
    if (!player) throw new NotFoundException('Player not found');

    if (player.photoId) {
      await this.gridFsService.deleteFile('playersPhotos', player.photoId);
    }

    return player.deleteOne();
  }
}
