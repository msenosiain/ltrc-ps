import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { File as MulterFile } from 'multer';
import { GridFsService } from '../shared/gridfs/gridfs.service';
import { MatchEntity } from './schemas/match.entity';
import { TournamentEntity } from '../tournaments/schemas/tournament.entity';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PaginationDto } from '../shared/pagination.dto';
import { PaginatedResponse, RoleEnum } from '@ltrc-campo/shared-api-model';
import { MatchFiltersDto } from './match-filter.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { RecordMatchAttendanceDto } from './dto/record-match-attendance.dto';
import { SquadsService } from '../squads/squads.service';
import { User } from '../users/schemas/user.schema';

const POPULATE_FIELDS = [
  'tournament',
  { path: 'squad.player' },
  { path: 'attendance.player' },
  { path: 'videos.targetPlayers' },
];

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(MatchEntity.name)
    private readonly matchModel: Model<MatchEntity>,
    @InjectModel(TournamentEntity.name)
    private readonly tournamentModel: Model<TournamentEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    private readonly squadsService: SquadsService,
    private readonly gridFsService: GridFsService
  ) {}

  async create(dto: CreateMatchDto, caller?: User) {
    const callerId = caller ? (caller as any)._id : undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.matchModel.create({ ...(dto as any), createdBy: callerId, updatedBy: callerId });
  }

  async update(id: string, dto: UpdateMatchDto, caller?: User) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    Object.assign(match, dto);
    if (caller) match.updatedBy = (caller as any)._id;
    return match.save();
  }

  async updateSquad(
    id: string,
    squad: { shirtNumber: number; playerId: string }[]
  ) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    match.set(
      'squad',
      squad.map(({ shirtNumber, playerId }) => ({
        shirtNumber,
        player: playerId,
      }))
    );
    return this.stripOrphanedSquad(
      await (await match.save()).populate(POPULATE_FIELDS)
    );
  }

  async recordAttendance(
    matchId: string,
    dto: RecordMatchAttendanceDto,
    callerId: string
  ) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');

    const now = new Date();

    for (const record of dto.records) {
      let existing: any;

      if (record.isStaff && record.userId) {
        existing = match.attendance.find(
          (a) => a.isStaff && a.user === record.userId
        );
        if (!existing) {
          existing = {
            user: record.userId,
            isStaff: true,
            confirmed: false,
          };
          match.attendance.push(existing);
          existing = match.attendance[match.attendance.length - 1];
        }
      } else if (record.playerId) {
        existing = match.attendance.find(
          (a) => !a.isStaff && a.player?.toString() === record.playerId
        );
        if (!existing) {
          existing = {
            player: record.playerId as any,
            isStaff: false,
            confirmed: false,
          };
          match.attendance.push(existing);
          existing = match.attendance[match.attendance.length - 1];
        }
      }

      if (existing) {
        existing.status = record.status;
        existing.markedAt = now;
        existing.markedBy = callerId;
      }
    }

    await match.save();
    return match.populate(POPULATE_FIELDS);
  }

  async findPaginated(
    pagination: PaginationDto<MatchFiltersDto>,
    caller?: User
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters: Record<string, unknown> = {};

    if (filters.status) {
      queryFilters['status'] = filters.status;
    }

    if (filters.opponent) {
      queryFilters['opponent'] = filters.opponent;
    }

    if (filters.tournament) {
      queryFilters['tournament'] = filters.tournament;
    }

    // Sport filter: two-step query via tournament lookup, also include friendly matches with direct sport field
    if (filters.sport) {
      const tournamentIds = await this.tournamentModel
        .find({ sport: filters.sport })
        .distinct('_id')
        .exec();
      if (filters.tournament) {
        const matches = tournamentIds.some(
          (id) => id.toString() === filters.tournament
        );
        if (!matches) {
          return { items: [], total: 0, page, size };
        }
      } else {
        queryFilters['$or'] = [
          { tournament: { $in: tournamentIds } },
          { tournament: { $exists: false }, sport: filters.sport },
        ];
      }
    }

    if (filters.category) {
      queryFilters['category'] = filters.category;
    }

    if (filters.fromDate || filters.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.fromDate) dateFilter['$gte'] = new Date(filters.fromDate);
      if (filters.toDate) dateFilter['$lte'] = new Date(filters.toDate);
      queryFilters['date'] = dateFilter;
    }

    if (filters.playerId) {
      queryFilters['squad.player'] = filters.playerId;
    }

    // Server-side restriction: limit results to user's assigned scope
    if (caller && !caller.roles?.includes(RoleEnum.ADMIN)) {
      let sports = caller.sports ?? [];
      let categories = caller.categories ?? [];

      // Fall back to linked player's sport/category when not set on the user
      if (!sports.length || !categories.length) {
        const player = await this.playerModel
          .findOne({ userId: String(caller._id) })
          .select('sport category')
          .exec();
        if (!sports.length && player?.sport) sports = [player.sport as any];
        if (!categories.length && player?.category) categories = [player.category as any];
      }

      if (sports.length) {
        const sportTournamentIds = await this.tournamentModel
          .find({ sport: { $in: sports } })
          .distinct('_id')
          .exec();
        const existing = queryFilters['$or'];
        if (!existing) {
          queryFilters['$or'] = [
            { tournament: { $in: sportTournamentIds } },
            { tournament: { $exists: false }, sport: { $in: sports } },
          ];
        }
      }
      if (categories.length)
        queryFilters['category'] = { $in: categories };
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      sort['category'] = 1;
    } else {
      sort['date'] = -1;
      sort['category'] = 1;
    }

    const [items, total] = await Promise.all([
      this.matchModel
        .find(queryFilters)
        .skip(skip)
        .limit(size)
        .sort(sort)
        .populate(POPULATE_FIELDS)
        .exec(),
      this.matchModel.countDocuments(queryFilters).exec(),
    ]);

    return { items, total, page, size };
  }

  async addAttachment(matchId: string, file: MulterFile) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');

    const fileId = await this.gridFsService.uploadFile(
      'matchAttachments',
      file.originalname,
      file.buffer,
      file.mimetype
    );

    match.attachments = match.attachments ?? [];
    match.attachments.push({ fileId, filename: file.originalname, mimeType: file.mimetype });
    await match.save();

    return { fileId, filename: file.originalname, mimeType: file.mimetype };
  }

  async getAttachmentStream(matchId: string, fileId: string) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    const att = match.attachments?.find((a) => a.fileId === fileId);
    if (!att) throw new NotFoundException('Attachment not found');
    return { stream: this.gridFsService.getFileStream('matchAttachments', fileId), mimeType: att.mimeType };
  }

  async deleteAttachment(matchId: string, fileId: string) {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    const idx = match.attachments?.findIndex((a) => a.fileId === fileId) ?? -1;
    if (idx === -1) throw new NotFoundException('Attachment not found');

    await this.gridFsService.deleteFile('matchAttachments', fileId);
    match.attachments.splice(idx, 1);
    await match.save();
  }

  async findPlayerByUserId(userId: string) {
    return this.playerModel.findOne({ userId: new Types.ObjectId(userId) }).select('_id');
  }

  async getFieldOptions() {
    const [opponents, venues, divisions] = await Promise.all([
      this.matchModel.distinct('opponent'),
      this.matchModel.distinct('venue'),
      this.matchModel.distinct('division').then((vals) => vals.filter(Boolean)),
    ]);
    return { opponents, venues, divisions };
  }

  async findOne(id: string) {
    const match = await this.matchModel.findById(id).populate(POPULATE_FIELDS);
    if (!match) throw new NotFoundException('Match not found');
    return this.stripOrphanedSquad(match);
  }

  private stripOrphanedSquad(match: MatchEntity) {
    match.set(
      'squad',
      (match.squad ?? []).filter((e) => e.player != null)
    );
    return match;
  }

  async applySquadTemplate(id: string, squadId: string) {
    const [match, squadEntries] = await Promise.all([
      this.matchModel.findById(id),
      this.squadsService.getPlayers(squadId),
    ]);
    if (!match) throw new NotFoundException('Match not found');

    match.set(
      'squad',
      squadEntries.map((e) => ({
        shirtNumber: e.shirtNumber,
        player: e.player,
      }))
    );
    return this.stripOrphanedSquad(
      await (await match.save()).populate(POPULATE_FIELDS)
    );
  }

  async delete(id: string) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');
    return match.deleteOne();
  }
}
