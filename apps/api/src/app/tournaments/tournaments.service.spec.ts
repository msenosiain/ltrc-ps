import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentEntity } from './schemas/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { GridFsService } from '../shared/gridfs/gridfs.service';

const mockTournament = {
  id: 'tournament-1',
  name: 'Liga Provincial',
  season: '2026',
  description: 'Torneo anual',
  save: jest.fn(),
  deleteOne: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
};

describe('TournamentsService', () => {
  let service: TournamentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        { provide: getModelToken(TournamentEntity.name), useValue: mockModel },
        { provide: GridFsService, useValue: { uploadFile: jest.fn(), deleteFile: jest.fn(), getFileStream: jest.fn() } },
      ],
    }).compile();

    service = module.get(TournamentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a tournament', async () => {
      mockModel.create.mockResolvedValueOnce(mockTournament);
      const dto: CreateTournamentDto = {
        name: 'Liga Provincial',
        season: '2026',
      };

      const result = await service.create(dto);

      expect(mockModel.create).toHaveBeenCalledWith({ ...dto, createdBy: undefined, updatedBy: undefined });
      expect(result).toEqual(mockTournament);
    });
  });

  describe('findPaginated()', () => {
    it('should return paginated tournaments', async () => {
      const execMock = jest.fn().mockResolvedValue([mockTournament]);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      mockModel.find.mockReturnValue({ sort: sortMock });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual({ items: [mockTournament], total: 1, page: 1, size: 10 });
    });
  });

  describe('findOne()', () => {
    it('should return a tournament by id', async () => {
      mockModel.findById.mockResolvedValueOnce(mockTournament);

      const result = await service.findOne('tournament-1');

      expect(mockModel.findById).toHaveBeenCalledWith('tournament-1');
      expect(result).toEqual(mockTournament);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update()', () => {
    it('should update a tournament', async () => {
      const updated = { ...mockTournament, name: 'Copa Argentina' };
      const tournament = {
        ...mockTournament,
        save: jest.fn().mockResolvedValue(updated),
      };
      mockModel.findById.mockResolvedValueOnce(tournament);

      const result = await service.update('tournament-1', {
        name: 'Copa Argentina',
      });

      expect(tournament.save).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete()', () => {
    it('should delete a tournament', async () => {
      const tournament = {
        ...mockTournament,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(tournament);

      await service.delete('tournament-1');

      expect(tournament.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
