import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchEntity } from './schemas/match.entity';
import { SquadsService } from '../squads/squads.service';
import { MatchStatusEnum } from '@ltrc-ps/shared-api-model';

const POPULATE_FIELDS = [
  'tournament',
  { path: 'squad.player' },
  { path: 'videos.targetPlayers' },
];

const mockMatch = {
  id: 'match-1',
  date: new Date('2026-03-07'),
  opponent: 'Rivadavia RC',
  venue: 'Cancha Marista',
  isHome: true,
  status: MatchStatusEnum.UPCOMING,
  squad: [],
  save: jest.fn(),
  deleteOne: jest.fn(),
  set: jest.fn(),
  populate: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
};

const mockSquadsService = {
  getPlayers: jest.fn(),
};

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getModelToken(MatchEntity.name), useValue: mockModel },
        { provide: SquadsService, useValue: mockSquadsService },
      ],
    }).compile();

    service = module.get(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a match', async () => {
      mockModel.create.mockResolvedValueOnce(mockMatch);
      const dto = {
        opponent: 'Rivadavia RC',
        venue: 'Cancha Marista',
        isHome: true,
        date: new Date(),
      };

      const result = await service.create(dto as any);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockMatch);
    });
  });

  describe('update()', () => {
    it('should update a match', async () => {
      const match = {
        ...mockMatch,
        save: jest.fn().mockResolvedValue(mockMatch),
      };
      mockModel.findById.mockResolvedValueOnce(match);

      await service.update('match-1', { opponent: 'Los Pumas RC' });

      expect(match.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateSquad()', () => {
    it('should map playerId to player and update squad', async () => {
      const populated = { ...mockMatch };
      const match = {
        ...mockMatch,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({
          populate: jest.fn().mockResolvedValue(populated),
        }),
      };
      mockModel.findById.mockResolvedValueOnce(match);

      await service.updateSquad('match-1', [
        { shirtNumber: 1, playerId: 'player-id-1' },
        { shirtNumber: 2, playerId: 'player-id-2' },
      ]);

      expect(match.set).toHaveBeenCalledWith('squad', [
        { shirtNumber: 1, player: 'player-id-1' },
        { shirtNumber: 2, player: 'player-id-2' },
      ]);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.updateSquad('bad-id', [])).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findPaginated()', () => {
    it('should return paginated matches', async () => {
      const execMock = jest.fn().mockResolvedValue([mockMatch]);
      const countMock = jest.fn().mockResolvedValue(1);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockReturnValue({ exec: countMock });

      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(result.items).toEqual([mockMatch]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply status filter', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { status: MatchStatusEnum.UPCOMING },
      });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: MatchStatusEnum.UPCOMING })
      );
    });
  });

  describe('findOne()', () => {
    it('should return a match by id', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(mockMatch),
      });

      const result = await service.findOne('match-1');

      expect(result).toEqual(mockMatch);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('applySquadTemplate()', () => {
    it('should apply squad players from a template', async () => {
      const squadPlayers = [
        { shirtNumber: 1, player: 'player-id-1' },
        { shirtNumber: 2, player: 'player-id-2' },
      ];
      const populated = { ...mockMatch, squad: squadPlayers };
      const match = {
        ...mockMatch,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({
          populate: jest.fn().mockResolvedValue(populated),
        }),
      };
      mockModel.findById.mockResolvedValueOnce(match);
      mockSquadsService.getPlayers.mockResolvedValueOnce(squadPlayers);

      const result = await service.applySquadTemplate('match-1', 'squad-1');

      expect(mockSquadsService.getPlayers).toHaveBeenCalledWith('squad-1');
      expect(match.set).toHaveBeenCalledWith(
        'squad',
        squadPlayers.map(({ shirtNumber, player }) => ({ shirtNumber, player }))
      );
      expect(result).toEqual(populated);
    });

    it('should throw NotFoundException when match not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      mockSquadsService.getPlayers.mockResolvedValueOnce([]);
      await expect(
        service.applySquadTemplate('bad-id', 'squad-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should delete a match', async () => {
      const match = {
        ...mockMatch,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(match);

      await service.delete('match-1');

      expect(match.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
