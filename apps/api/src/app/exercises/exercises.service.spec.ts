import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExerciseEntity } from './schemas/exercise.entity';
import { ExerciseCategoryEnum } from '@ltrc-campo/shared-api-model';

const mockExercise = {
  _id: 'exercise-1',
  name: 'Sentadilla con barra',
  category: ExerciseCategoryEnum.STRENGTH,
  muscleGroups: ['cuádriceps', 'glúteos'],
  equipment: ['barra'],
  save: jest.fn(),
  deleteOne: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  insertMany: jest.fn(),
};

describe('ExercisesService', () => {
  let service: ExercisesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: getModelToken(ExerciseEntity.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get(ExercisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit()', () => {
    it('should seed exercises when collection is empty', async () => {
      mockModel.countDocuments.mockResolvedValueOnce(0);
      mockModel.insertMany.mockResolvedValueOnce([]);

      await service.onModuleInit();

      expect(mockModel.insertMany).toHaveBeenCalled();
    });

    it('should not seed exercises when collection already has documents', async () => {
      mockModel.countDocuments.mockResolvedValueOnce(10);

      await service.onModuleInit();

      expect(mockModel.insertMany).not.toHaveBeenCalled();
    });
  });

  describe('findPaginated()', () => {
    it('should return paginated exercises', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockExercise]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(result.items).toEqual([mockExercise]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply category filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { category: ExerciseCategoryEnum.STRENGTH },
      });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: ExerciseCategoryEnum.STRENGTH })
      );
    });

    it('should apply muscleGroup filter', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { muscleGroup: 'cuádriceps' },
      });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ muscleGroups: { $in: ['cuádriceps'] } })
      );
    });

    it('should apply searchTerm filter with accent-insensitive regex', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { searchTerm: 'sentadilla' },
      });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ name: expect.any(RegExp) })
      );
    });
  });

  describe('findOne()', () => {
    it('should return an exercise by id', async () => {
      mockModel.findById.mockResolvedValueOnce(mockExercise);

      const result = await service.findOne('exercise-1');

      expect(result).toEqual(mockExercise);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('should create an exercise', async () => {
      mockModel.create.mockResolvedValueOnce(mockExercise);
      const dto = {
        name: 'Sentadilla con barra',
        category: ExerciseCategoryEnum.STRENGTH,
        muscleGroups: ['cuádriceps'],
        equipment: ['barra'],
      };

      const result = await service.create(dto as any, 'caller-id');

      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: 'caller-id',
        updatedBy: 'caller-id',
      });
      expect(result).toEqual(mockExercise);
    });
  });

  describe('update()', () => {
    it('should update an existing exercise', async () => {
      const exercise = {
        ...mockExercise,
        save: jest.fn().mockResolvedValue(mockExercise),
      };
      mockModel.findById.mockResolvedValueOnce(exercise);

      const result = await service.update('exercise-1', { name: 'Press de banca' } as any, 'caller-id');

      expect(exercise.save).toHaveBeenCalled();
      expect(result).toEqual(mockExercise);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should delete an exercise', async () => {
      const exercise = {
        ...mockExercise,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(exercise);

      await service.delete('exercise-1');

      expect(exercise.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
