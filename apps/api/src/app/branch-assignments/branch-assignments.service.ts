import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import * as XLSX from 'xlsx';
import { BranchAssignmentEntity } from './schemas/branch-assignment.entity';
import { CreateBranchAssignmentDto } from './dto/create-branch-assignment.dto';
import { UpdateBranchAssignmentDto } from './dto/update-branch-assignment.dto';
import { BranchAssignmentFilterDto } from './dto/branch-assignment-filter.dto';
import { PlayerEntity } from '../players/schemas/player.entity';

const POPULATE_PLAYER = [
  {
    path: 'player',
    select: 'name nickName idNumber birthDate sport category branch position alternatePosition',
  },
];

@Injectable()
export class BranchAssignmentsService {
  constructor(
    @InjectModel(BranchAssignmentEntity.name)
    private readonly assignmentModel: Model<BranchAssignmentEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>
  ) {}

  async create(dto: CreateBranchAssignmentDto, assignedById?: string) {
    const existing = await this.assignmentModel.findOne({
      player: dto.player,
      season: dto.season,
    });
    if (existing) {
      throw new ConflictException(
        `La jugadora ya tiene rama asignada para la temporada ${dto.season}`
      );
    }

    const assignment = await this.assignmentModel.create({
      player: dto.player,
      branch: dto.branch,
      category: dto.category,
      season: dto.season,
      sport: dto.sport ?? SportEnum.HOCKEY,
      assignedBy: assignedById || undefined,
      assignedAt: new Date(),
    });

    await this.syncPlayerBranch(dto.player, dto.season);

    return assignment.populate(POPULATE_PLAYER);
  }

  async findAll(filters: BranchAssignmentFilterDto) {
    const query: Record<string, unknown> = {};
    if (filters.player) query['player'] = filters.player;
    if (filters.branch) query['branch'] = filters.branch;
    if (filters.category) query['category'] = filters.category;
    if (filters.season) query['season'] = filters.season;

    return this.assignmentModel
      .find(query)
      .sort({ season: -1, category: 1, branch: 1 })
      .populate(POPULATE_PLAYER)
      .exec();
  }

  async findOne(id: string) {
    const assignment = await this.assignmentModel
      .findById(id)
      .populate(POPULATE_PLAYER);
    if (!assignment) throw new NotFoundException('Asignación no encontrada');
    return assignment;
  }

  async update(id: string, dto: UpdateBranchAssignmentDto) {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    if (dto.branch) assignment.branch = dto.branch;
    const saved = await assignment.save();

    await this.syncPlayerBranch(
      assignment.player.toString(),
      assignment.season
    );

    return saved.populate(POPULATE_PLAYER);
  }

  async delete(id: string) {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    const playerId = assignment.player.toString();
    const season = assignment.season;

    await assignment.deleteOne();
    await this.syncPlayerBranch(playerId, season);
  }

  async importFromFile(
    buffer: Buffer,
    season: number,
    assignedById?: string
  ): Promise<{
    created: number;
    updated: number;
    errors: { row: number; message: string }[];
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<BranchImportRow>(sheet);

    let created = 0;
    let updated = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const dni = String(row.DNI ?? '').replace(/\D/g, '');
      const nombre = String(row['Apellido Nombre'] ?? '').trim();
      const division = String(row['División'] ?? '').trim().toUpperCase();
      const bloque = String(row.Bloque ?? '').trim().toUpperCase();
      const label = `${dni} | ${nombre || '?'} | ${division || '?'} | ${bloque || '?'}`;

      if (!dni) {
        errors.push({ row: rowNum, message: `${label}: DNI es requerido` });
        continue;
      }

      const category = DIVISION_TO_CATEGORY[division];
      if (!category) {
        errors.push({
          row: rowNum,
          message: `${label}: División desconocida: ${division}`,
        });
        continue;
      }

      if (!Object.values(HockeyBranchEnum).includes(bloque as HockeyBranchEnum)) {
        errors.push({
          row: rowNum,
          message: `${label}: Bloque desconocido: ${bloque}`,
        });
        continue;
      }
      const branch = bloque as HockeyBranchEnum;

      // Find player by DNI
      const player = await this.playerModel.findOne({ idNumber: dni });
      if (!player) {
        errors.push({
          row: rowNum,
          message: `${label}: Jugadora no encontrada`,
        });
        continue;
      }

      try {
        const existing = await this.assignmentModel.findOne({
          player: player._id,
          season,
        });

        if (existing) {
          existing.branch = branch;
          existing.category = category;
          await existing.save();
          updated++;
        } else {
          await this.assignmentModel.create({
            player: player._id,
            branch,
            category,
            season,
            sport: SportEnum.HOCKEY,
            assignedBy: assignedById || undefined,
            assignedAt: new Date(),
          });
          created++;
        }

        await this.syncPlayerBranch(player._id.toString(), season);
      } catch (err) {
        errors.push({
          row: rowNum,
          message: `DNI ${dni}: ${(err as Error).message}`,
        });
      }
    }

    return { created, updated, errors };
  }

  /**
   * Sync the player.branch cache field with the current season assignment.
   */
  private async syncPlayerBranch(playerId: string, season: number) {
    const currentYear = new Date().getFullYear();
    if (season !== currentYear) return;

    const current = await this.assignmentModel.findOne({
      player: playerId,
      season: currentYear,
    });

    await this.playerModel.findByIdAndUpdate(playerId, {
      branch: current?.branch ?? null,
    });
  }
}

/** Row shape from the branch config Excel */
interface BranchImportRow {
  DNI: string | number;
  'Fecha Nacimiento'?: unknown;
  Edad?: number;
  'Apellido Nombre'?: string;
  'División': string;
  Bloque: string;
}

/** Map Excel division names to CategoryEnum values */
const DIVISION_TO_CATEGORY: Record<string, CategoryEnum> = {
  PRIMERA: CategoryEnum.PLANTEL_SUPERIOR,
  INTERMEDIA: CategoryEnum.PLANTEL_SUPERIOR,
  CUARTA: CategoryEnum.CUARTA,
  QUINTA: CategoryEnum.QUINTA,
  SEXTA: CategoryEnum.SEXTA,
  SEPTIMA: CategoryEnum.SEPTIMA,
  OCTAVA: CategoryEnum.OCTAVA,
  NOVENA: CategoryEnum.NOVENA,
  DECIMA: CategoryEnum.DECIMA,
  'PRE-DECIMA': CategoryEnum.PRE_DECIMA,
  'PRE DECIMA': CategoryEnum.PRE_DECIMA,
  PREDECIMA: CategoryEnum.PRE_DECIMA,
  MASTER: CategoryEnum.MASTER,
};
