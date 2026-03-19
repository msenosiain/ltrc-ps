import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BranchAssignmentsService } from './branch-assignments.service';
import { BranchAssignmentEntity } from './schemas/branch-assignment.entity';
import { PlayerEntity } from '../players/schemas/player.entity';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import * as XLSX from 'xlsx';

const mockAssignment = {
  id: 'assignment-1',
  player: 'player-id-1',
  branch: HockeyBranchEnum.A,
  category: CategoryEnum.PLANTEL_SUPERIOR,
  season: 2026,
  sport: SportEnum.HOCKEY,
  assignedAt: new Date(),
  save: jest.fn(),
  deleteOne: jest.fn(),
  populate: jest.fn(),
  toString: () => 'player-id-1',
};

const mockAssignmentModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
};

const mockPlayerModel = {
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('BranchAssignmentsService', () => {
  let service: BranchAssignmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchAssignmentsService,
        {
          provide: getModelToken(BranchAssignmentEntity.name),
          useValue: mockAssignmentModel,
        },
        {
          provide: getModelToken(PlayerEntity.name),
          useValue: mockPlayerModel,
        },
      ],
    }).compile();

    service = module.get(BranchAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const dto = {
      player: 'player-id-1',
      branch: HockeyBranchEnum.A,
      category: CategoryEnum.PLANTEL_SUPERIOR,
      season: 2026,
    };

    it('should create an assignment and sync player branch', async () => {
      mockAssignmentModel.findOne.mockResolvedValueOnce(null); // no existing
      const created = {
        ...mockAssignment,
        populate: jest.fn().mockResolvedValue(mockAssignment),
      };
      mockAssignmentModel.create.mockResolvedValueOnce(created);
      // syncPlayerBranch: findOne for current year, then findByIdAndUpdate
      mockAssignmentModel.findOne.mockResolvedValueOnce({
        branch: HockeyBranchEnum.A,
      });
      mockPlayerModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await service.create(dto as any);

      expect(mockAssignmentModel.findOne).toHaveBeenCalledWith({
        player: dto.player,
        season: dto.season,
      });
      expect(mockAssignmentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          player: dto.player,
          branch: dto.branch,
          category: dto.category,
          season: dto.season,
          sport: SportEnum.HOCKEY,
        })
      );
      expect(created.populate).toHaveBeenCalled();
      expect(result).toEqual(mockAssignment);
    });

    it('should throw ConflictException if assignment already exists', async () => {
      mockAssignmentModel.findOne.mockResolvedValueOnce(mockAssignment);

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll()', () => {
    it('should return all assignments with no filters', async () => {
      const execMock = jest.fn().mockResolvedValue([mockAssignment]);
      mockAssignmentModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      const result = await service.findAll({});

      expect(mockAssignmentModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockAssignment]);
    });

    it('should apply filters', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockAssignmentModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      await service.findAll({
        branch: HockeyBranchEnum.B,
        season: 2026,
      });

      expect(mockAssignmentModel.find).toHaveBeenCalledWith({
        branch: HockeyBranchEnum.B,
        season: 2026,
      });
    });
  });

  describe('findOne()', () => {
    it('should return an assignment by id', async () => {
      mockAssignmentModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(mockAssignment),
      });

      const result = await service.findOne('assignment-1');

      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException when not found', async () => {
      mockAssignmentModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update()', () => {
    it('should update the branch of an assignment', async () => {
      const assignment = {
        ...mockAssignment,
        player: { toString: () => 'player-id-1' },
        save: jest.fn().mockResolvedValue({
          ...mockAssignment,
          branch: HockeyBranchEnum.B,
          populate: jest.fn().mockResolvedValue({
            ...mockAssignment,
            branch: HockeyBranchEnum.B,
          }),
        }),
      };
      mockAssignmentModel.findById.mockResolvedValueOnce(assignment);
      // syncPlayerBranch
      mockAssignmentModel.findOne.mockResolvedValueOnce({
        branch: HockeyBranchEnum.B,
      });
      mockPlayerModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await service.update('assignment-1', {
        branch: HockeyBranchEnum.B,
      });

      expect(assignment.save).toHaveBeenCalled();
      expect(result).toMatchObject({ branch: HockeyBranchEnum.B });
    });

    it('should throw NotFoundException when not found', async () => {
      mockAssignmentModel.findById.mockResolvedValueOnce(null);

      await expect(
        service.update('bad-id', { branch: HockeyBranchEnum.A })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should delete an assignment and sync player branch', async () => {
      const assignment = {
        ...mockAssignment,
        player: { toString: () => 'player-id-1' },
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockAssignmentModel.findById.mockResolvedValueOnce(assignment);
      // syncPlayerBranch
      mockAssignmentModel.findOne.mockResolvedValueOnce(null);
      mockPlayerModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      await service.delete('assignment-1');

      expect(assignment.deleteOne).toHaveBeenCalled();
      expect(mockPlayerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'player-id-1',
        { branch: null }
      );
    });

    it('should throw NotFoundException when not found', async () => {
      mockAssignmentModel.findById.mockResolvedValueOnce(null);

      await expect(service.delete('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('importFromFile()', () => {
    function buildExcelBuffer(
      rows: Record<string, unknown>[]
    ): Buffer {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
    }

    const currentYear = new Date().getFullYear();

    it('should create new assignments from valid data', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '12345678',
          'Apellido Nombre': 'García María',
          'División': 'PRIMERA',
          Bloque: 'A',
        },
      ]);

      mockPlayerModel.findOne.mockResolvedValueOnce({
        _id: 'player-id-1',
      });
      mockAssignmentModel.findOne.mockResolvedValueOnce(null); // no existing
      mockAssignmentModel.create.mockResolvedValueOnce(mockAssignment);
      // syncPlayerBranch
      mockAssignmentModel.findOne.mockResolvedValueOnce({
        branch: HockeyBranchEnum.A,
      });
      mockPlayerModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should update existing assignments', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '12345678',
          'Apellido Nombre': 'García María',
          'División': 'CUARTA',
          Bloque: 'B',
        },
      ]);

      mockPlayerModel.findOne.mockResolvedValueOnce({
        _id: 'player-id-1',
      });
      const existingAssignment = {
        branch: HockeyBranchEnum.A,
        category: CategoryEnum.PLANTEL_SUPERIOR,
        save: jest.fn().mockResolvedValue(true),
      };
      mockAssignmentModel.findOne.mockResolvedValueOnce(existingAssignment);
      // syncPlayerBranch
      mockAssignmentModel.findOne.mockResolvedValueOnce({
        branch: HockeyBranchEnum.B,
      });
      mockPlayerModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
      expect(existingAssignment.branch).toBe(HockeyBranchEnum.B);
      expect(existingAssignment.category).toBe(CategoryEnum.CUARTA);
    });

    it('should report error when DNI is missing', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '',
          'Apellido Nombre': 'Sin DNI',
          'División': 'PRIMERA',
          Bloque: 'A',
        },
      ]);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('DNI es requerido');
      expect(result.created).toBe(0);
    });

    it('should report error for unknown division', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '12345678',
          'Apellido Nombre': 'Test',
          'División': 'INEXISTENTE',
          Bloque: 'A',
        },
      ]);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('División desconocida');
    });

    it('should report error for unknown bloque', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '12345678',
          'Apellido Nombre': 'Test',
          'División': 'PRIMERA',
          Bloque: 'Z',
        },
      ]);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Bloque desconocido');
    });

    it('should report error when player is not found', async () => {
      const buffer = buildExcelBuffer([
        {
          DNI: '99999999',
          'Apellido Nombre': 'No Existe',
          'División': 'PRIMERA',
          Bloque: 'A',
        },
      ]);

      mockPlayerModel.findOne.mockResolvedValueOnce(null);

      const result = await service.importFromFile(buffer, currentYear);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Jugadora no encontrada');
    });
  });
});
