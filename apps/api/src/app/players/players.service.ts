import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlayerEntity } from './schemas/player.entity';
import { GridFsService } from '../shared/gridfs/gridfs.service';
import type { File as MulterFile } from 'multer';
import { PaginationDto } from '../shared/pagination.dto';
import {
  ClothingSizesEnum,
  HockeyPositions,
  parseDate,
  PaginatedResponse,
  Player,
  Role,
  RugbyPositions,
} from '@ltrc-ps/shared-api-model';
import { PlayerFiltersDto } from './player-filter.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ImportPlayerRow } from './dto/import-player.dto';
import * as XLSX from 'xlsx';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    private readonly gridFsService: GridFsService,
    private readonly usersService: UsersService
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

    let player;
    try {
      player = await this.playerModel.create({
        ...dto,
        photoId,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0];
        const value = err.keyValue?.[field];
        throw new ConflictException(
          `Ya existe un jugador con ${field} "${value}"`
        );
      }
      throw err;
    }

    if (dto.createUser && dto.email) {
      const existing = await this.usersService.findOneByEmail(dto.email);
      if (existing) {
        throw new ConflictException(
          `El email ${dto.email} ya está registrado como usuario`
        );
      }

      const user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        roles: [Role.PLAYER],
      });

      player.userId = (user as any)._id;
      await player.save();
    }

    return player;
  }

  async update(id: string, dto: UpdatePlayerDto, photo?: MulterFile) {
    const player = await this.playerModel.findById(id);
    if (!player) throw new NotFoundException('Player not found');

    if (photo) {
      if (player.photoId) {
        await this.gridFsService.deleteFile('playersPhotos', player.photoId);
      }
      player.photoId = await this.gridFsService.uploadFile(
        'playersPhotos',
        photo.originalname,
        photo.buffer,
        photo.mimetype
      );
    }

    Object.assign(player, dto);

    if (dto.createUser && dto.email && !player.userId) {
      const existing = await this.usersService.findOneByEmail(dto.email);
      if (existing) {
        throw new ConflictException(
          `El email ${dto.email} ya está registrado como usuario`
        );
      }

      const user = await this.usersService.create({
        name: dto.name ?? player.name,
        email: dto.email,
        roles: [Role.PLAYER],
      });

      player.userId = (user as any)._id;
    }

    try {
      return await player.save();
    } catch (err: any) {
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0];
        const value = err.keyValue?.[field];
        throw new ConflictException(
          `Ya existe un jugador con ${field} "${value}"`
        );
      }
      throw err;
    }
  }

  async findPaginated(
    pagination: PaginationDto<PlayerFiltersDto>,
    caller?: User
  ): Promise<PaginatedResponse<Player>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters = {};

    // searchTerm → name o nickName
    if (filters.searchTerm) {
      queryFilters['$or'] = [
        { name: { $regex: new RegExp(filters.searchTerm, 'i') } },
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

    // sport
    if (filters.sport) {
      queryFilters['sport'] = filters.sport;
    }

    // category
    if (filters.category) {
      queryFilters['category'] = filters.category;
    }

    // branch (hockey)
    if (filters.branch) {
      queryFilters['branch'] = filters.branch;
    }

    // Coach server-side filter override
    if (caller?.roles?.includes(Role.COACH)) {
      if (caller.sports?.length) queryFilters['sport'] = { $in: caller.sports };
      if (caller.categories?.length)
        queryFilters['category'] = { $in: caller.categories };
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['name'] = 1;
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

  async getFieldOptions() {
    const healthInsurances = await this.playerModel
      .distinct('medicalData.healthInsurance')
      .then((vals) => vals.filter(Boolean));
    return { healthInsurances };
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

  async importFromFile(
    buffer: Buffer
  ): Promise<{ created: number; errors: { row: number; message: string }[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportPlayerRow>(sheet);

    let created = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based + header row

      const validationError = this.validateImportRow(row);
      if (validationError) {
        errors.push({ row: rowNum, message: validationError });
        continue;
      }

      try {
        const str = (val: unknown) => String(val).trim();

        const birthDate = parseDate(row.birthDate)!;
        const jerseySize = row.jersey
          ? (str(row.jersey).toUpperCase() as ClothingSizesEnum)
          : undefined;
        const shortSize = row.short
          ? (str(row.short).toUpperCase() as ClothingSizesEnum)
          : undefined;
        const phoneNumber = row.phone ? str(row.phone) : undefined;

        await this.playerModel.create({
          name: str(row.name),
          idNumber: str(row.idNumber),
          email: str(row.email),
          birthDate,
          ...(row.position && { position: row.position }),
          nickName: row.nickName ? str(row.nickName) : undefined,
          ...(row.alternatePosition && {
            alternatePosition: row.alternatePosition,
          }),
          clothingSizes:
            jerseySize || shortSize
              ? {
                  jersey: jerseySize,
                  sweater: jerseySize,
                  shorts: shortSize,
                  pants: shortSize,
                }
              : undefined,
          address: phoneNumber ? { phoneNumber } : undefined,
          medicalData: this.buildMedicalData(row, str),
        });

        created++;
      } catch (err) {
        errors.push({ row: rowNum, message: (err as Error).message });
      }
    }

    return { created, errors };
  }

  private validateImportRow(row: ImportPlayerRow): string | null {
    const str = (val: unknown) => (val != null ? String(val).trim() : '');

    if (!str(row.name)) return 'name es requerido';
    if (!str(row.idNumber)) return 'idNumber es requerido';
    if (!str(row.email)) return 'email es requerido';
    const allPositions = new Set([
      ...Object.values(RugbyPositions),
      ...Object.values(HockeyPositions),
    ]);
    if (row.position && !allPositions.has(row.position)) {
      return `position inválida: ${row.position}`;
    }
    if (!parseDate(row.birthDate)) {
      return 'birthDate inválida (formato esperado: dd/MM/yyyy)';
    }
    return null;
  }

  private buildMedicalData(
    row: ImportPlayerRow,
    str: (val: unknown) => string
  ):
    | {
        height?: number;
        weight?: number;
        torgIndex?: number;
        healthInsurance?: string;
      }
    | undefined {
    const d = {
      height: row.height ? Number(row.height) : undefined,
      weight: row.weight ? Number(row.weight) : undefined,
      torgIndex: row.torgIndex ? Number(row.torgIndex) : undefined,
      healthInsurance: row.healthInsurance
        ? str(row.healthInsurance)
        : undefined,
    };
    return Object.values(d).some((v) => v !== undefined) ? d : undefined;
  }
}
