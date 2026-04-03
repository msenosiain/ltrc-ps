import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TrainingSessionsService } from './training-sessions.service';
import { TrainingSessionEntity } from './schemas/training-session.entity';
import { TrainingScheduleEntity } from '../schedules/schemas/training-schedule.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';
import { MatchEntity } from '../../matches/schemas/match.entity';
import { User } from '../../users/schemas/user.schema';
import { RoleEnum, SportEnum, CategoryEnum } from '@ltrc-campo/shared-api-model';

const mockSessionModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  populate: jest.fn(),
};

const mockScheduleModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockPlayerModel = {
  findOne: jest.fn(),
};

const mockUserModel = {
  find: jest.fn(),
};

const mockMatchModel = {
  find: jest.fn(),
};

describe('TrainingSessionsService', () => {
  let service: TrainingSessionsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingSessionsService,
        { provide: getModelToken(TrainingSessionEntity.name), useValue: mockSessionModel },
        { provide: getModelToken(TrainingScheduleEntity.name), useValue: mockScheduleModel },
        { provide: getModelToken(PlayerEntity.name), useValue: mockPlayerModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(MatchEntity.name), useValue: mockMatchModel },
      ],
    }).compile();

    service = module.get(TrainingSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAttendanceStats()', () => {
    const makeSession = (category: string, attendance: any[] = []) => ({
      category,
      attendance,
    });

    it('should return stats grouped by category (baseline, no filters)', async () => {
      const sessions = [
        makeSession('m14', [
          { isStaff: false, status: 'present' },
          { isStaff: false, status: 'absent' },
          { isStaff: true, status: 'present' },
        ]),
      ];
      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(sessions) });

      const result = await service.getAttendanceStats();

      expect(result.byCategory).toHaveProperty('m14');
      expect(result.byCategory['m14'].sessions).toBe(1);
      expect(result.byCategory['m14'].totalAttendees).toBe(2);
      expect(result.byCategory['m14'].totalPresent).toBe(1);
      expect(result.byCategory['m14'].pct).toBe(50);
    });

    it('should pass sport filter directly in the query', async () => {
      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(undefined, { sport: SportEnum.RUGBY });

      expect(mockSessionModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ sport: SportEnum.RUGBY })
      );
    });

    it('should pass category filter directly in the query', async () => {
      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(undefined, { category: CategoryEnum.PLANTEL_SUPERIOR });

      expect(mockSessionModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: CategoryEnum.PLANTEL_SUPERIOR })
      );
    });

    it('should pass both sport and category filters in the query', async () => {
      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(undefined, {
        sport: SportEnum.HOCKEY,
        category: CategoryEnum.QUINTA,
      });

      expect(mockSessionModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          sport: SportEnum.HOCKEY,
          category: CategoryEnum.QUINTA,
        })
      );
    });

    it('sport filter overrides scope filter from caller sports', async () => {
      const caller = {
        roles: [],
        sports: [SportEnum.RUGBY],
        categories: [],
      } as unknown as User;

      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(caller, { sport: SportEnum.HOCKEY });

      const callArg = mockSessionModel.find.mock.calls[0][0];
      // The filter.sport string value replaces the $in array from caller scope
      expect(callArg['sport']).toBe(SportEnum.HOCKEY);
    });

    it('category filter overrides scope filter from caller categories', async () => {
      const caller = {
        roles: [],
        sports: [],
        categories: [CategoryEnum.M19],
      } as unknown as User;

      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(caller, { category: CategoryEnum.PLANTEL_SUPERIOR });

      const callArg = mockSessionModel.find.mock.calls[0][0];
      expect(callArg['category']).toBe(CategoryEnum.PLANTEL_SUPERIOR);
    });

    it('ADMIN caller has no scope filter, only explicit filters apply', async () => {
      const adminCaller = {
        roles: [RoleEnum.ADMIN],
        sports: [],
        categories: [],
      } as unknown as User;

      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats(adminCaller, { sport: SportEnum.RUGBY });

      const callArg = mockSessionModel.find.mock.calls[0][0];
      expect(callArg['sport']).toBe(SportEnum.RUGBY);
      // No $in wrapping — admin has no scope restriction
      expect(callArg['sport']).not.toEqual(expect.objectContaining({ $in: expect.anything() }));
    });

    it('should return pct=0 when there are no attendees', async () => {
      mockSessionModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([makeSession('m12', [])]),
      });

      const result = await service.getAttendanceStats();

      expect(result.byCategory['m12'].pct).toBe(0);
    });

    it('no filters and no caller → query contains only date range', async () => {
      mockSessionModel.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await service.getAttendanceStats();

      const callArg = mockSessionModel.find.mock.calls[0][0];
      expect(callArg).toHaveProperty('date');
      expect(callArg['sport']).toBeUndefined();
      expect(callArg['category']).toBeUndefined();
    });
  });
});
