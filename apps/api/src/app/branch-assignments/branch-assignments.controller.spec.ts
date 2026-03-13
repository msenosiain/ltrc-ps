import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BranchAssignmentsController } from './branch-assignments.controller';
import { BranchAssignmentsService } from './branch-assignments.service';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

import type { File as MulterFile } from 'multer';

const mockAssignment = {
  id: 'assignment-1',
  player: 'player-id-1',
  branch: HockeyBranchEnum.A,
  category: CategoryEnum.PLANTEL_SUPERIOR,
  season: 2026,
  sport: SportEnum.HOCKEY,
};

describe('BranchAssignmentsController', () => {
  let controller: BranchAssignmentsController;
  let service: jest.Mocked<BranchAssignmentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchAssignmentsController],
      providers: [
        {
          provide: BranchAssignmentsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockAssignment]),
            create: jest.fn().mockResolvedValue(mockAssignment),
            findOne: jest.fn().mockResolvedValue(mockAssignment),
            update: jest.fn().mockResolvedValue({
              ...mockAssignment,
              branch: HockeyBranchEnum.B,
            }),
            delete: jest.fn().mockResolvedValue(undefined),
            importFromFile: jest.fn().mockResolvedValue({
              created: 2,
              updated: 1,
              errors: [],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get(BranchAssignmentsController);
    service = module.get(BranchAssignmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all assignments', async () => {
      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual([mockAssignment]);
    });

    it('should pass filters to the service', async () => {
      const filters = {
        branch: HockeyBranchEnum.A,
        season: 2026,
      };
      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('create()', () => {
    it('should create a new assignment', async () => {
      const dto = {
        player: 'player-id-1',
        branch: HockeyBranchEnum.A,
        category: CategoryEnum.PLANTEL_SUPERIOR,
        season: 2026,
      };
      const req = { user: { id: 'user-1' } } as any;

      const result = await controller.create(dto as any, req);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(mockAssignment);
    });

    it('should handle missing user in request', async () => {
      const dto = {
        player: 'player-id-1',
        branch: HockeyBranchEnum.A,
        category: CategoryEnum.PLANTEL_SUPERIOR,
        season: 2026,
      };
      const req = {} as any;

      const result = await controller.create(dto as any, req);

      expect(service.create).toHaveBeenCalledWith(dto, undefined);
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('findOne()', () => {
    it('should return a single assignment', async () => {
      const result = await controller.findOne('assignment-1');

      expect(service.findOne).toHaveBeenCalledWith('assignment-1');
      expect(result).toEqual(mockAssignment);
    });

    it('should propagate NotFoundException from service', () => {
      service.findOne.mockRejectedValueOnce(new NotFoundException());

      expect(controller.findOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update()', () => {
    it('should update an assignment', async () => {
      const dto = { branch: HockeyBranchEnum.B };
      const result = await controller.update('assignment-1', dto as any);

      expect(service.update).toHaveBeenCalledWith('assignment-1', dto);
      expect(result).toMatchObject({ branch: HockeyBranchEnum.B });
    });

    it('should propagate NotFoundException from service', () => {
      service.update.mockRejectedValueOnce(new NotFoundException());

      expect(
        controller.update('nonexistent', { branch: HockeyBranchEnum.A } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should delete an assignment', async () => {
      await controller.delete('assignment-1');

      expect(service.delete).toHaveBeenCalledWith('assignment-1');
    });

    it('should propagate NotFoundException from service', () => {
      service.delete.mockRejectedValueOnce(new NotFoundException());

      expect(controller.delete('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('importFromFile()', () => {
    it('should import assignments from file', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'branches.xlsx',
      } as MulterFile;
      const req = { user: { id: 'user-1' } } as any;

      const result = await controller.importFromFile(file, '2026', req);

      expect(service.importFromFile).toHaveBeenCalledWith(
        file.buffer,
        2026,
        'user-1'
      );
      expect(result).toEqual({ created: 2, updated: 1, errors: [] });
    });

    it('should default season to current year when not a number', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'branches.xlsx',
      } as MulterFile;
      const req = { user: { id: 'user-1' } } as any;

      await controller.importFromFile(file, 'invalid', req);

      expect(service.importFromFile).toHaveBeenCalledWith(
        file.buffer,
        new Date().getFullYear(),
        'user-1'
      );
    });
  });
});
