import { Test, TestingModule } from '@nestjs/testing';
import { TrainingSessionsController } from './training-sessions.controller';
import { TrainingSessionsService } from './training-sessions.service';
import { SportEnum, CategoryEnum } from '@ltrc-campo/shared-api-model';

const mockStatsResult = { byCategory: {} };

const mockService = {
  findPaginated: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, size: 10 }),
  create: jest.fn().mockResolvedValue({}),
  findOne: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  getUpcomingForUser: jest.fn().mockResolvedValue([]),
  confirmAttendance: jest.fn().mockResolvedValue({}),
  cancelConfirmation: jest.fn().mockResolvedValue({}),
  getStaffForSession: jest.fn().mockResolvedValue([]),
  recordAttendance: jest.fn().mockResolvedValue({}),
  getAttendanceStats: jest.fn().mockResolvedValue(mockStatsResult),
};

describe('TrainingSessionsController', () => {
  let controller: TrainingSessionsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingSessionsController],
      providers: [{ provide: TrainingSessionsService, useValue: mockService }],
    }).compile();

    controller = module.get(TrainingSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAttendanceStats()', () => {
    it('should call service with user and no filters when no query params', async () => {
      const mockReq = { user: { _id: 'user-1', roles: [] } } as any;

      const result = await controller.getAttendanceStats(mockReq, undefined, undefined);

      expect(mockService.getAttendanceStats).toHaveBeenCalledWith(
        mockReq.user,
        { sport: undefined, category: undefined }
      );
      expect(result).toEqual(mockStatsResult);
    });

    it('should pass sport query param to service', async () => {
      const mockReq = { user: { _id: 'user-1', roles: [] } } as any;

      await controller.getAttendanceStats(mockReq, SportEnum.RUGBY, undefined);

      expect(mockService.getAttendanceStats).toHaveBeenCalledWith(
        mockReq.user,
        { sport: SportEnum.RUGBY, category: undefined }
      );
    });

    it('should pass category query param to service', async () => {
      const mockReq = { user: { _id: 'user-1', roles: [] } } as any;

      await controller.getAttendanceStats(mockReq, undefined, CategoryEnum.PLANTEL_SUPERIOR);

      expect(mockService.getAttendanceStats).toHaveBeenCalledWith(
        mockReq.user,
        { sport: undefined, category: CategoryEnum.PLANTEL_SUPERIOR }
      );
    });

    it('should pass both sport and category query params to service', async () => {
      const mockReq = { user: { _id: 'user-1', roles: [] } } as any;

      await controller.getAttendanceStats(mockReq, SportEnum.HOCKEY, CategoryEnum.QUINTA);

      expect(mockService.getAttendanceStats).toHaveBeenCalledWith(
        mockReq.user,
        { sport: SportEnum.HOCKEY, category: CategoryEnum.QUINTA }
      );
    });
  });
});
