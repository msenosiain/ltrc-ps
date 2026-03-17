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
  calculateCategory,
  ClothingSizesEnum,
  HockeyPositions,
  parseDate,
  PaginatedResponse,
  Player,
  RoleEnum,
  RugbyPositions,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { PlayerFiltersDto } from './player-filter.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ImportPlayerRow, PadronRow, SurveyRow } from './dto/import-player.dto';
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
        roles: [RoleEnum.PLAYER],
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
        roles: [RoleEnum.PLAYER],
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

    // position → busca en el array positions
    if (filters.position) {
      queryFilters['positions'] = filters.position;
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

    // Server-side restriction: limit results to user's assigned scope
    // (applies to any non-admin user with sports/categories/branches assigned)
    if (caller && !caller.roles?.includes(RoleEnum.ADMIN)) {
      if (caller.sports?.length) queryFilters['sport'] = { $in: caller.sports };
      if (caller.categories?.length)
        queryFilters['category'] = { $in: caller.categories };
      if (caller.branches?.length)
        queryFilters['branch'] = { $in: caller.branches };
    }

    // Sorting
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['category'] = 1;
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

    let created = 0;
    const errors: { row: number; message: string }[] = [];

    const sportMap: Record<string, SportEnum> = {
      hockey: SportEnum.HOCKEY,
      rugby: SportEnum.RUGBY,
    };

    for (const sheetName of workbook.SheetNames) {
      const sport = sportMap[sheetName.toLowerCase()];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<PadronRow>(sheet);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        const label = sport
          ? `[${sheetName}] fila ${rowNum}`
          : `fila ${rowNum}`;

        const str = (val: unknown) => (val != null ? String(val).trim() : '');
        const toTitleCase = (s: string) =>
          s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

        const name = toTitleCase(str(row.Nombre));
        const idNumber = str(row['N° Doc.']).replace(/\D/g, '');
        const email = str(row.Email).toLowerCase();

        if (!name) {
          errors.push({
            row: rowNum,
            message: `${label}: Nombre es requerido`,
          });
          continue;
        }
        if (!idNumber) {
          errors.push({
            row: rowNum,
            message: `${label}: N° Doc. es requerido`,
          });
          continue;
        }

        const birthDate = parseDate(row['Fecha Nac.']);
        if (!birthDate) {
          errors.push({
            row: rowNum,
            message: `${label}: Fecha Nac. inválida`,
          });
          continue;
        }

        const birthYear = birthDate.getFullYear();
        const category = sport
          ? calculateCategory(birthYear, sport)
          : undefined;

        const parentName = toTitleCase(str(row['Nombre Jefe']));
        const memberNumber = row.Socio ? String(row.Socio) : undefined;

        const isMinor =
          new Date().getFullYear() - birthDate.getFullYear() < 18;
        const hasDistinctParent =
          isMinor && parentName && parentName.toUpperCase() !== name.toUpperCase();

        const parentContacts = hasDistinctParent
          ? [{
              name: parentName,
              ...(email ? { email } : {}),
            }]
          : undefined;

        try {
          await this.playerModel.create({
            name,
            idNumber,
            email: email || undefined,
            birthDate,
            sport,
            category,
            memberNumber,
            parentContacts,
          });
          created++;
        } catch (err) {
          errors.push({
            row: rowNum,
            message: `${label}: ${(err as Error).message}`,
          });
        }
      }
    }

    return { created, errors };
  }

  async updateFromSurvey(buffer: Buffer): Promise<{
    updated: number;
    notFound: { row: number; dni: string; name: string }[];
    errors: { row: number; message: string }[];
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<SurveyRow>(sheet);

    let updated = 0;
    const notFound: { row: number; dni: string; name: string }[] = [];
    const errors: { row: number; message: string }[] = [];

    const validSizes = new Set(Object.values(ClothingSizesEnum));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const str = (val: unknown) => (val != null ? String(val).trim() : '');

      const dni = str(row.DNI).replace(/\D/g, '');
      if (!dni) {
        errors.push({ row: rowNum, message: 'DNI vacío' });
        continue;
      }

      try {
        const player = await this.playerModel.findOne({ idNumber: dni });
        if (!player) {
          const name =
            [str(row.Apellido), str(row.Nombre)].filter(Boolean).join(', ') ||
            '—';
          notFound.push({ row: rowNum, dni, name });
          continue;
        }

        const phone = str(row.Telefono);
        if (phone) {
          player.address = {
            ...(player.address ?? { phoneNumber: '' }),
            phoneNumber: phone,
          };
        }

        const healthInsurance = str(row['Obra Social']);
        if (
          healthInsurance &&
          healthInsurance !== '-' &&
          healthInsurance !== '.'
        ) {
          player.medicalData = {
            ...(player.medicalData ?? {}),
            healthInsurance,
          };
        }

        const jersey = str(
          row['Talle Camiseta']
        ).toUpperCase() as ClothingSizesEnum;
        const shorts = str(
          row['Talle Short/Falda']
        ).toUpperCase() as ClothingSizesEnum;
        const hasJersey = validSizes.has(jersey);
        const hasShorts = validSizes.has(shorts);

        if (hasJersey || hasShorts) {
          player.clothingSizes = {
            ...(player.clothingSizes ?? {}),
            ...(hasJersey ? { jersey, sweater: jersey } : {}),
            ...(hasShorts ? { shorts, pants: shorts } : {}),
          };
        }

        const email = str(row['Correo Electrónico']);
        if (email && !player.email) {
          player.email = email;
        }

        await player.save();
        updated++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: `DNI ${dni}: ${(err as Error).message}`,
        });
      }
    }

    return { updated, notFound, errors };
  }

}
