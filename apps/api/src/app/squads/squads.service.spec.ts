import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { SquadsService } from './squads.service';
import { SquadEntity } from './schemas/squad.entity';
import { CreateSquadDto } from './dto/create-squad.dto';

const POPULATE_PLAYERS = [{ path: 'players.player' }];

const mockPlayers = [
  { shirtNumber: 1, player: 'player-id-1' },
  { shirtNumber: 2, player: 'player-id-2' },
];

const mockSquad = {
  id: 'squad-1',
  name: 'Equipo Titular',
  players: mockPlayers,
  save: jest.fn(),
  deleteOne: jest.fn(),
  set: jest.fn(),
  populate: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

describe('SquadsService', () => {
  let service: SquadsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SquadsService,
        { provide: getModelToken(SquadEntity.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get(SquadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should map playerId to player and create squad', async () => {
      const dto: CreateSquadDto = {
        name: 'Equipo Titular',
        players: [
          { shirtNumber: 1, playerId: 'player-id-1' },
          { shirtNumber: 2, playerId: 'player-id-2' },
        ],
      };
      const created = {
        ...mockSquad,
        populate: jest.fn().mockResolvedValue(mockSquad),
      };
      mockModel.create.mockResolvedValueOnce(created);

      const result = await service.create(dto);

      expect(mockModel.create).toHaveBeenCalledWith({
        name: 'Equipo Titular',
        players: [
          { shirtNumber: 1, player: 'player-id-1' },
          { shirtNumber: 2, player: 'player-id-2' },
        ],
      });
      expect(created.populate).toHaveBeenCalledWith(POPULATE_PLAYERS);
      expect(result).toEqual(mockSquad);
    });
  });

  describe('findAll()', () => {
    it('should return all squads sorted by name', async () => {
      const execMock = jest.fn().mockResolvedValue([mockSquad]);
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({ exec: execMock }),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual([mockSquad]);
    });
  });

  describe('findOne()', () => {
    it('should return a squad by id', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(mockSquad),
      });

      const result = await service.findOne('squad-1');

      expect(mockModel.findById).toHaveBeenCalledWith('squad-1');
      expect(result).toEqual(mockSquad);
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

  describe('update()', () => {
    it('should update squad name', async () => {
      const squad = {
        ...mockSquad,
        name: 'Equipo Titular',
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({
          ...mockSquad,
          populate: jest.fn().mockResolvedValue(mockSquad),
        }),
      };
      mockModel.findById.mockResolvedValueOnce(squad);

      await service.update('squad-1', { name: 'Equipo Suplente' });

      expect(squad.name).toBe('Equipo Suplente');
      expect(squad.save).toHaveBeenCalled();
    });

    it('should remap players on update', async () => {
      const squad = {
        ...mockSquad,
        set: jest.fn(),
        save: jest.fn().mockResolvedValue({
          ...mockSquad,
          populate: jest.fn().mockResolvedValue(mockSquad),
        }),
      };
      mockModel.findById.mockResolvedValueOnce(squad);

      await service.update('squad-1', {
        players: [{ shirtNumber: 3, playerId: 'player-id-3' }],
      });

      expect(squad.set).toHaveBeenCalledWith('players', [
        { shirtNumber: 3, player: 'player-id-3' },
      ]);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete()', () => {
    it('should delete a squad', async () => {
      const squad = {
        ...mockSquad,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(squad);

      await service.delete('squad-1');

      expect(squad.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlayers()', () => {
    it('should return players from a squad', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(mockSquad),
      });

      const result = await service.getPlayers('squad-1');

      expect(result).toEqual(mockPlayers);
    });

    it('should throw NotFoundException when squad not found', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(service.getPlayers('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
