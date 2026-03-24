import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchStatusEnum } from '@ltrc-campo/shared-api-model';

const mockMatch = {
  id: 'match-1',
  opponent: 'Rivadavia RC',
  venue: 'Cancha Marista',
  isHome: true,
  status: MatchStatusEnum.UPCOMING,
  category: 'plantel_superior',
  tournament: 'tournament-1',
  squad: [],
  attendance: [],
};

const mockService = {
  findPaginated: jest
    .fn()
    .mockResolvedValue({ items: [mockMatch], total: 1, page: 1, size: 10 }),
  create: jest.fn().mockResolvedValue(mockMatch),
  update: jest.fn().mockResolvedValue(mockMatch),
  updateSquad: jest.fn().mockResolvedValue(mockMatch),
  recordAttendance: jest.fn().mockResolvedValue(mockMatch),
  applySquadTemplate: jest.fn().mockResolvedValue(mockMatch),
  findOne: jest.fn().mockResolvedValue(mockMatch),
  delete: jest.fn().mockResolvedValue(mockMatch),
};

describe('MatchesController', () => {
  let controller: MatchesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [{ provide: MatchesService, useValue: mockService }],
    }).compile();
    controller = module.get(MatchesController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findPaginated() should return paginated matches', async () => {
    const mockReq = { user: { roles: [] } } as any;
    const result = await controller.findPaginated({ page: 1, size: 10 }, mockReq);
    expect(result.items).toEqual([mockMatch]);
    expect(result.total).toBe(1);
  });

  it('create() should create a match', async () => {
    const mockReq = { user: { _id: 'user-1' } } as any;
    expect(
      await controller.create({ opponent: 'Rivadavia RC' } as any, mockReq)
    ).toEqual(mockMatch);
  });

  it('update() should update a match', async () => {
    const mockReq = { user: { _id: 'user-1' } } as any;
    expect(
      await controller.update('match-1', { opponent: 'Los Pumas' }, mockReq)
    ).toEqual(mockMatch);
    expect(mockService.update).toHaveBeenCalledWith('match-1', {
      opponent: 'Los Pumas',
    }, mockReq.user);
  });

  it('updateSquad() should update match squad', async () => {
    const dto = { squad: [{ shirtNumber: 1, playerId: 'p1' }] };
    expect(await controller.updateSquad('match-1', dto)).toEqual(mockMatch);
    expect(mockService.updateSquad).toHaveBeenCalledWith('match-1', dto.squad);
  });

  it('recordAttendance() should record attendance', async () => {
    const mockReq = { user: { id: 'user-1' } } as any;
    const dto = { records: [{ playerId: 'p1', isStaff: false, status: 'present' }] };
    expect(await controller.recordAttendance('match-1', dto as any, mockReq)).toEqual(mockMatch);
    expect(mockService.recordAttendance).toHaveBeenCalledWith('match-1', dto, 'user-1');
  });

  it('applySquadTemplate() should apply a squad template', async () => {
    expect(await controller.applySquadTemplate('match-1', 'squad-1')).toEqual(
      mockMatch
    );
    expect(mockService.applySquadTemplate).toHaveBeenCalledWith(
      'match-1',
      'squad-1'
    );
  });

  it('getOne() should return a match', async () => {
    const mockReq = { user: { _id: 'user-1' } } as any;
    expect(await controller.getOne('match-1', mockReq)).toEqual(mockMatch);
  });

  it('getOne() should propagate NotFoundException', async () => {
    const mockReq = { user: { _id: 'user-1' } } as any;
    mockService.findOne.mockRejectedValueOnce(new NotFoundException());
    await expect(controller.getOne('bad-id', mockReq)).rejects.toThrow(
      NotFoundException
    );
  });

  it('delete() should delete a match', async () => {
    expect(await controller.delete('match-1')).toEqual(mockMatch);
    expect(mockService.delete).toHaveBeenCalledWith('match-1');
  });
});
