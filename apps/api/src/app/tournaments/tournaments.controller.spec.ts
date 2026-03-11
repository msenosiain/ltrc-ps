import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

const mockTournament = {
  id: 'tournament-1',
  name: 'Liga Provincial',
  season: '2026',
};

const mockService = {
  findPaginated: jest.fn().mockResolvedValue({ items: [mockTournament], total: 1, page: 1, size: 10 }),
  create: jest.fn().mockResolvedValue(mockTournament),
  findOne: jest.fn().mockResolvedValue(mockTournament),
  update: jest.fn().mockResolvedValue(mockTournament),
  delete: jest.fn().mockResolvedValue(mockTournament),
};

describe('TournamentsController', () => {
  let controller: TournamentsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsController],
      providers: [{ provide: TournamentsService, useValue: mockService }],
    }).compile();
    controller = module.get(TournamentsController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll() should return paginated tournaments', async () => {
    const mockReq = { user: { roles: [] } } as any;
    const result = await controller.findAll({} as any, mockReq);
    expect(result.items).toEqual([mockTournament]);
    expect(result.total).toBe(1);
  });

  it('create() should create a tournament', async () => {
    expect(
      await controller.create({ name: 'Liga Provincial', season: '2026' })
    ).toEqual(mockTournament);
  });

  it('getOne() should return a tournament', async () => {
    expect(await controller.getOne('tournament-1')).toEqual(mockTournament);
  });

  it('getOne() should propagate NotFoundException', async () => {
    mockService.findOne.mockRejectedValueOnce(new NotFoundException());
    await expect(controller.getOne('bad-id')).rejects.toThrow(
      NotFoundException
    );
  });

  it('update() should update a tournament', async () => {
    expect(
      await controller.update('tournament-1', { name: 'Copa Argentina' })
    ).toEqual(mockTournament);
    expect(mockService.update).toHaveBeenCalledWith('tournament-1', {
      name: 'Copa Argentina',
    });
  });

  it('delete() should delete a tournament', async () => {
    expect(await controller.delete('tournament-1')).toEqual(mockTournament);
    expect(mockService.delete).toHaveBeenCalledWith('tournament-1');
  });
});
