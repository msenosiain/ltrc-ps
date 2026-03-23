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
  CategoryEnum,
  ClothingSizesEnum,
  HockeyPositions,
  parseDate,
  PaginatedResponse,
  Player,
  PlayerAvailabilityEnum,
  PlayerStatusEnum,
  RoleEnum,
  RugbyPositions,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
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

  async create(dto: CreatePlayerDto, photo?: MulterFile, caller?: User) {
    let photoId: string | undefined;

    if (photo) {
      photoId = await this.gridFsService.uploadFile(
        'playersPhotos',
        photo.originalname,
        photo.buffer,
        photo.mimetype
      );
    }

    const callerId = caller ? (caller as any)._id : undefined;
    let player;
    try {
      player = await this.playerModel.create({
        ...dto,
        photoId,
        createdBy: callerId,
        updatedBy: callerId,
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

  async update(id: string, dto: UpdatePlayerDto, photo?: MulterFile, caller?: User) {
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
    if (caller) player.updatedBy = (caller as any)._id;

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

    const queryFilters: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    // status filter — default to active only (includes legacy docs without status field)
    if (filters.status) {
      if (filters.status === PlayerStatusEnum.ACTIVE) {
        andConditions.push({
          $or: [
            { status: PlayerStatusEnum.ACTIVE },
            { status: { $exists: false } },
          ],
        });
      } else {
        queryFilters['status'] = filters.status;
      }
    } else {
      andConditions.push({
        $or: [
          { status: PlayerStatusEnum.ACTIVE },
          { status: { $exists: false } },
        ],
      });
    }

    // searchTerm → name o nickName
    // Non-letter chars (apostrophes, backticks, etc.) are ignored between letters,
    // so "dan" matches "D'an", "D`An", etc.
    if (filters.searchTerm) {
      const buildFuzzyPattern = (term: string) =>
        term
          .replace(/[^a-záéíóúüñ\s]/gi, '')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.split('').join('[^a-záéíóúüñ]*'))
          .join('.*');

      const pattern = buildFuzzyPattern(filters.searchTerm);
      const regex = new RegExp(pattern || filters.searchTerm, 'i');
      andConditions.push({
        $or: [
          { name: { $regex: regex } },
          { nickName: { $regex: regex } },
        ],
      });
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

    // availableForTraining: exclude called_up, suspended, leave (keep injured + available)
    if (filters.availableForTraining) {
      andConditions.push({
        $or: [
          { 'availability.status': { $exists: false } },
          { 'availability.status': PlayerAvailabilityEnum.AVAILABLE },
          { 'availability.status': PlayerAvailabilityEnum.INJURED },
        ],
      });
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

    if (andConditions.length) {
      queryFilters['$and'] = andConditions;
    }

    // Sorting
    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['name'] = 1;
    }

    // When searching without explicit sort, boost results where the term matches
    // the last word of the name (apellido) so "Martin Santiago" appears first
    // when searching "Santiago".
    if (filters.searchTerm && !sortBy) {
      const termRegex = filters.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const [items, total] = await Promise.all([
        this.playerModel.aggregate([
          { $match: queryFilters },
          {
            $addFields: {
              id: { $toString: '$_id' },
              _lastNameMatch: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $arrayElemAt: [{ $split: ['$name', ' '] }, 0] },
                      regex: termRegex,
                      options: 'i',
                    },
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
          { $sort: { _lastNameMatch: -1, name: 1 } },
          { $skip: skip },
          { $limit: size },
        ]),
        this.playerModel.countDocuments(queryFilters).exec(),
      ]);
      return { items: items as unknown as Player[], total, page, size };
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

  async updateSelf(userId: string, dto: { address?: { phoneNumber?: string }; clothingSizes?: { jersey?: ClothingSizesEnum; shorts?: ClothingSizesEnum; sweater?: ClothingSizesEnum; pants?: ClothingSizesEnum } }) {
    const player = await this.playerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!player) throw new NotFoundException('No player linked to this user');

    if (dto.address !== undefined) {
      player.address = { ...(player.address ?? { phoneNumber: '' }), ...dto.address };
    }
    if (dto.clothingSizes !== undefined) {
      player.clothingSizes = { ...(player.clothingSizes ?? {}), ...dto.clothingSizes };
    }

    return player.save();
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
  ): Promise<{ created: number; updated: number; errors: { row: number; message: string }[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    const sportMap: Record<string, SportEnum> = {
      hockey: SportEnum.HOCKEY,
      rugby: SportEnum.RUGBY,
    };

    // Categorías fijas del padrón (no dependen de la edad)
    const fixedCategoryMap: Record<string, CategoryEnum> = {
      HM: CategoryEnum.PLANTEL_SUPERIOR,
      HMV: CategoryEnum.MASTER,
      RM: CategoryEnum.PLANTEL_SUPERIOR,
    };
    // Estas se calculan por fecha de nacimiento + deporte
    const calculateFromAge = new Set(['HCM', 'HI', 'RC', 'RI', 'RJ']);

    for (const sheetName of workbook.SheetNames) {
      const sport = sportMap[sheetName.toLowerCase()];
      if (!sport) continue; // ignorar hojas que no sean hockey/rugby

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<PadronRow>(sheet);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        const label = `[${sheetName}] fila ${rowNum}`;

        const str = (val: unknown) => (val != null ? String(val).trim() : '');
        const toTitleCase = (s: string) =>
          s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

        const name = toTitleCase(str(row.Nombre));
        const idNumber = str(row['N° Doc.']).replace(/\D/g, '');

        if (!name) {
          errors.push({ row: rowNum, message: `${label}: Nombre es requerido` });
          continue;
        }
        if (!idNumber) {
          errors.push({ row: rowNum, message: `${label}: N° Doc. es requerido` });
          continue;
        }

        const birthDate = parseDate(row['Fecha Nac.']);
        if (!birthDate) {
          errors.push({ row: rowNum, message: `${label}: Fecha Nac. inválida` });
          continue;
        }

        const categoryKey = str(row['Categoría']).toUpperCase();
        let category: CategoryEnum | undefined;
        if (fixedCategoryMap[categoryKey]) {
          category = fixedCategoryMap[categoryKey];
        } else if (calculateFromAge.has(categoryKey)) {
          category = calculateCategory(birthDate.getFullYear(), sport);
        } else {
          errors.push({ row: rowNum, message: `${label}: Categoría desconocida "${categoryKey}"` });
          continue;
        }

        const memberNumber = row.Socio ? String(row.Socio) : undefined;

        try {
          const existing = await this.playerModel.findOne({
            idNumber: { $regex: new RegExp(idNumber) },
          });
          if (existing) {
            await this.playerModel.findByIdAndUpdate(existing._id, {
              name,
              birthDate,
              sport,
              category,
              ...(memberNumber ? { memberNumber } : {}),
            });
            updated++;
          } else {
            await this.playerModel.create({ name, idNumber, birthDate, sport, category, memberNumber });
            created++;
          }
        } catch (err) {
          errors.push({ row: rowNum, message: `${label}: ${(err as Error).message}` });
        }
      }
    }

    return { created, updated, errors };
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
