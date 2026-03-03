import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentEntity } from './schemas/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';

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
};

describe('TournamentsService', () => {
  let service: TournamentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        { provide: getModelToken(TournamentEntity.name), useValue: mockModel },
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

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTournament);
    });
  });

  describe('findAll()', () => {
    it('should return all tournaments sorted by name', async () => {
      const execMock = jest.fn().mockResolvedValue([mockTournament]);
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: execMock }),
      });

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockTournament]);
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
