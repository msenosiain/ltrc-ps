import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlayerEntity } from './schemas/player.entity';
import { GridFsService } from '../shared/gridfs/gridfs.service';
import type { File as MulterFile } from 'multer';
import { PaginationDto } from '../shared/pagination.dto';
import {
  DATE_FORMAT,
  PaginatedResponse,
  Player,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { PlayerFiltersDto } from './player-filter.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { ImportPlayerRow } from './dto/import-player.dto';
import * as XLSX from 'xlsx';
import { parse, isValid } from 'date-fns';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    private readonly gridFsService: GridFsService
  ) {}

  async create(dto: CreatePlayerDto, photo?: MulterFile) {
    let photoId: string | undefined;

    if (photo) {
      photoId = await this.gridFsService.uploadFile(
        'playersPhotos', // bucket
        photo.originalname, // filename
        photo.buffer, // buffer
        photo.mimetype // mime
      );
    }

    return await this.playerModel.create({
      ...dto,
      photoId,
    });
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

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const player = await this.playerModel.findById(id);
    if (!player) throw new NotFoundException('Player not found');
    return player;
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

  async importFromFile(
    buffer: Buffer,
    filename: string
  ): Promise<{ created: number; errors: { row: number; message: string }[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportPlayerRow>(sheet);

    let created = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based + header row

      try {
        const { lastName, firstName, idNumber, email, position } = row;

        if (!lastName) throw new Error('lastName es requerido');
        if (!firstName) throw new Error('firstName es requerido');
        if (!idNumber) throw new Error('idNumber es requerido');
        if (!email) throw new Error('email es requerido');
        if (!position) throw new Error('position es requerido');
        if (!Object.values(PlayerPositionEnum).includes(position)) {
          throw new Error(`position inválida: ${position}`);
        }

        const birthDate = this.parseImportDate(row.birthDate);
        if (!birthDate) throw new Error('birthDate inválida (formato esperado: dd/MM/yyyy)');

        await this.playerModel.create({
          lastName: String(lastName),
          firstName: String(firstName),
          idNumber: String(idNumber),
          email: String(email),
          position,
          birthDate,
          nickName: row.nickName ? String(row.nickName) : undefined,
          alternatePosition: row.alternatePosition ?? undefined,
          height: row.height ? Number(row.height) : undefined,
          weight: row.weight ? Number(row.weight) : undefined,
        });

        created++;
      } catch (err) {
        errors.push({ row: rowNum, message: (err as Error).message });
      }
    }

    return { created, errors };
  }

  private parseImportDate(val: unknown): Date | null {
    if (!val) return null;
    if (val instanceof Date) return isValid(val) ? val : null;
    const str = String(val).trim();
    if (!str) return null;
    const parsed = parse(str, DATE_FORMAT, new Date());
    return isValid(parsed) ? parsed : null;
  }
}
