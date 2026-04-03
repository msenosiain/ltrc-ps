jest.mock('xlsx');

import * as XLSX from 'xlsx';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerEntity } from './schemas/player.entity';
import { BranchAssignmentEntity } from '../branch-assignments/schemas/branch-assignment.entity';
import { GridFsService } from '../shared/gridfs/gridfs.service';
import { UsersService } from '../users/users.service';
import {
  playersArray,
  createPlayerDtoPlain,
} from '../shared/mocks/playerMocks';
import { plainToClass } from 'class-transformer';
import { CreatePlayerDto } from './dto/create-player.dto';
import type { File as MulterFile } from 'multer';
import {
  PlayerAvailabilityEnum,
  PlayerStatusEnum,
  RoleEnum,
  RugbyPositions,
  SortOrder,
  SportEnum,
  ClothingSizesEnum,
} from '@ltrc-campo/shared-api-model';

const mockPlayer = {
  ...playersArray[0],
  id: 'player-id-1',
  _id: 'player-id-1',
  photoId: undefined as string | undefined,
  userId: undefined as any,
  name: playersArray[0].name,
  email: playersArray[0].email,
  address: { phoneNumber: '123' },
  clothingSizes: {},
  medicalData: {},
  availability: undefined as any,
  trialStartDate: undefined as any,
  save: jest.fn(),
  deleteOne: jest.fn(),
  markModified: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  distinct: jest.fn(),
  aggregate: jest.fn(),
};

const mockGridFs = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileStream: jest.fn(),
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
};

const mockBranchAssignmentModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

describe('PlayersService', () => {
  let service: PlayersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        { provide: getModelToken(PlayerEntity.name), useValue: mockModel },
        { provide: getModelToken(BranchAssignmentEntity.name), useValue: mockBranchAssignmentModel },
        { provide: GridFsService, useValue: mockGridFs },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get(PlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // create()
  // ---------------------------------------------------------------------------
  describe('create()', () => {
    const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);

    it('should create a player without photo', async () => {
      mockModel.create.mockResolvedValueOnce({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        photoId: undefined,
        createdBy: undefined,
        updatedBy: undefined,
      });
      expect(result).toMatchObject({ id: '1' });
    });

    it('should upload photo and create player with photoId', async () => {
      const photo = {
        originalname: 'photo.jpg',
        buffer: Buffer.from(''),
        mimetype: 'image/jpeg',
      } as MulterFile;
      mockGridFs.uploadFile.mockResolvedValueOnce('gridfs-id-123');
      mockModel.create.mockResolvedValueOnce({
        id: '1',
        ...dto,
        photoId: 'gridfs-id-123',
      });

      const result = await service.create(dto, photo);

      expect(mockGridFs.uploadFile).toHaveBeenCalledWith(
        'playersPhotos',
        'photo.jpg',
        photo.buffer,
        'image/jpeg'
      );
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ photoId: 'gridfs-id-123' })
      );
      expect(result).toMatchObject({ photoId: 'gridfs-id-123' });
    });

    it('should include caller id in createdBy/updatedBy when caller is provided', async () => {
      const caller = { _id: 'caller-id', roles: [RoleEnum.ADMIN] } as any;
      mockModel.create.mockResolvedValueOnce({ id: '1', ...dto });

      await service.create(dto, undefined, caller);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'caller-id', updatedBy: 'caller-id' })
      );
    });

    it('should throw ConflictException on duplicate key error (code 11000)', async () => {
      const dupError = Object.assign(new Error('dup'), {
        code: 11000,
        keyPattern: { idNumber: 1 },
        keyValue: { idNumber: '12345' },
      });
      mockModel.create.mockRejectedValueOnce(dupError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should re-throw non-duplicate errors from create', async () => {
      const genericError = new Error('db error');
      mockModel.create.mockRejectedValueOnce(genericError);

      await expect(service.create(dto)).rejects.toThrow('db error');
    });

    it('should create user when createUser is true and email is new', async () => {
      const dtoWithUser = plainToClass(CreatePlayerDto, {
        ...createPlayerDtoPlain,
        createUser: true,
        email: 'new@lostordos.com.ar',
      });

      const savedPlayer = {
        ...mockPlayer,
        userId: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockModel.create.mockResolvedValueOnce(savedPlayer);
      mockUsersService.findOneByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValueOnce({ _id: 'user-id-1' });

      await service.create(dtoWithUser);

      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('new@lostordos.com.ar');
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(savedPlayer.save).toHaveBeenCalled();
      expect(savedPlayer.userId).toBe('user-id-1');
    });

    it('should throw ConflictException when createUser is true but email already exists', async () => {
      const dtoWithUser = plainToClass(CreatePlayerDto, {
        ...createPlayerDtoPlain,
        createUser: true,
        email: 'existing@lostordos.com.ar',
      });

      mockModel.create.mockResolvedValueOnce({ ...mockPlayer, save: jest.fn() });
      mockUsersService.findOneByEmail.mockResolvedValueOnce({ _id: 'existing-user' });

      await expect(service.create(dtoWithUser)).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------------------------------------------------------
  // update()
  // ---------------------------------------------------------------------------
  describe('update()', () => {
    it('should update an existing player', async () => {
      const player = {
        ...mockPlayer,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      const result = await service.update('player-id-1', {
        name: 'Updated',
      });

      expect(mockModel.findById).toHaveBeenCalledWith('player-id-1');
      expect(player.save).toHaveBeenCalled();
      expect(result).toMatchObject(mockPlayer);
    });

    it('should throw NotFoundException when player not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(
        NotFoundException
      );
    });

    it('should replace photo when a new one is provided', async () => {
      const player = {
        ...mockPlayer,
        photoId: 'old-photo-id',
        save: jest.fn().mockResolvedValue({ ...mockPlayer, photoId: 'new-photo-id' }),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);
      mockGridFs.uploadFile.mockResolvedValueOnce('new-photo-id');

      const photo = {
        originalname: 'new.jpg',
        buffer: Buffer.from(''),
        mimetype: 'image/jpeg',
      } as MulterFile;
      await service.update('player-id-1', {}, photo);

      expect(mockGridFs.deleteFile).toHaveBeenCalledWith(
        'playersPhotos',
        'old-photo-id'
      );
      expect(mockGridFs.uploadFile).toHaveBeenCalled();
      expect(player.photoId).toBe('new-photo-id');
    });

    it('should upload photo without deleting when player has no previous photoId', async () => {
      const player = {
        ...mockPlayer,
        photoId: undefined,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);
      mockGridFs.uploadFile.mockResolvedValueOnce('brand-new-id');

      const photo = { originalname: 'x.jpg', buffer: Buffer.from(''), mimetype: 'image/jpeg' } as MulterFile;
      await service.update('player-id-1', {}, photo);

      expect(mockGridFs.deleteFile).not.toHaveBeenCalled();
      expect(player.photoId).toBe('brand-new-id');
    });

    it('should throw ConflictException on duplicate key error on save', async () => {
      const player = {
        ...mockPlayer,
        save: jest.fn().mockRejectedValue(
          Object.assign(new Error('dup'), {
            code: 11000,
            keyPattern: { email: 1 },
            keyValue: { email: 'test@test.com' },
          })
        ),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await expect(service.update('player-id-1', {})).rejects.toThrow(ConflictException);
    });

    it('should re-throw non-duplicate errors on save', async () => {
      const player = {
        ...mockPlayer,
        save: jest.fn().mockRejectedValue(new Error('save failed')),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await expect(service.update('player-id-1', {})).rejects.toThrow('save failed');
    });

    it('should set caller updatedBy when caller is provided', async () => {
      const caller = { _id: 'editor-id', roles: [RoleEnum.ADMIN] } as any;
      const player = {
        ...mockPlayer,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
        updatedBy: undefined as any,
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.update('player-id-1', {}, undefined, caller);

      expect(player.updatedBy).toBe('editor-id');
    });

    it('should convert trialStartDate string to Date', async () => {
      const player = {
        ...mockPlayer,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
        trialStartDate: undefined as any,
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.update('player-id-1', { trialStartDate: '2024-01-15' } as any);

      expect(player.trialStartDate).toBeInstanceOf(Date);
      expect(player.markModified).toHaveBeenCalledWith('trialStartDate');
    });

    it('should keep trialStartDate as-is when already a Date', async () => {
      const existingDate = new Date('2024-01-15');
      const player = {
        ...mockPlayer,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
        trialStartDate: undefined as any,
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.update('player-id-1', { trialStartDate: existingDate } as any);

      expect(player.trialStartDate).toBe(existingDate);
    });

    it('should create user when createUser is true and player has no userId', async () => {
      const player = {
        ...mockPlayer,
        userId: undefined,
        email: 'player@x.com',
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);
      mockUsersService.findOneByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValueOnce({ _id: 'new-user-id' });

      await service.update('player-id-1', { createUser: true, email: 'player@x.com' } as any);

      expect(mockUsersService.create).toHaveBeenCalled();
      expect(player.userId).toBe('new-user-id');
    });

    it('should throw ConflictException when createUser email already registered', async () => {
      const player = {
        ...mockPlayer,
        userId: undefined,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);
      mockUsersService.findOneByEmail.mockResolvedValueOnce({ _id: 'existing' });

      await expect(
        service.update('player-id-1', { createUser: true, email: 'taken@x.com' } as any)
      ).rejects.toThrow(ConflictException);
    });

    it('should NOT create user when player already has a userId', async () => {
      const player = {
        ...mockPlayer,
        userId: 'already-linked',
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.update('player-id-1', { createUser: true, email: 'player@x.com' } as any);

      expect(mockUsersService.findOneByEmail).not.toHaveBeenCalled();
    });

    it('should call branchAssignmentModel.findOneAndUpdate for hockey player with branch+category', async () => {
      const savedPlayer = {
        ...mockPlayer,
        _id: 'player-id-1',
        sport: SportEnum.HOCKEY,
        category: 'sub18',
      };
      const player = {
        ...savedPlayer,
        save: jest.fn().mockResolvedValue(savedPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);
      mockBranchAssignmentModel.findOneAndUpdate.mockResolvedValueOnce({});

      await service.update('player-id-1', { branch: 'A' } as any);

      expect(mockBranchAssignmentModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ player: 'player-id-1' }),
        expect.objectContaining({ branch: 'A', sport: SportEnum.HOCKEY }),
        expect.objectContaining({ upsert: true })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findPaginated()
  // ---------------------------------------------------------------------------
  describe('findPaginated()', () => {
    const buildFindMock = (items = playersArray, total = playersArray.length) => {
      const execMock = jest.fn().mockResolvedValue(items);
      const countMock = jest.fn().mockResolvedValue(total);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockReturnValue({ exec: countMock });
    };

    it('should return paginated players', async () => {
      buildFindMock();
      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(result.items).toEqual(playersArray);
      expect(result.total).toBe(playersArray.length);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });

    it('should filter by non-ACTIVE status', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { status: PlayerStatusEnum.INACTIVE } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.status).toBe(PlayerStatusEnum.INACTIVE);
    });

    it('should use $or condition for ACTIVE status (includes docs without field)', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { status: PlayerStatusEnum.ACTIVE } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.$and).toBeDefined();
      const orCond = findCall.$and[0];
      expect(orCond.$or).toEqual(
        expect.arrayContaining([{ status: PlayerStatusEnum.ACTIVE }])
      );
    });

    it('should filter by position', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { position: RugbyPositions.FULLBACK } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.positions).toBe(RugbyPositions.FULLBACK);
    });

    it('should filter by sport', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { sport: SportEnum.RUGBY } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.sport).toBe(SportEnum.RUGBY);
    });

    it('should filter by category', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { category: 'sub18' as any } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.category).toBe('sub18');
    });

    it('should filter by branch', async () => {
      buildFindMock();
      await service.findPaginated({ page: 1, size: 10, filters: { branch: 'A' as any } });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.branch).toBe('A');
    });

    it('should filter by availability AVAILABLE using $or', async () => {
      buildFindMock();
      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { availability: PlayerAvailabilityEnum.AVAILABLE },
      });

      const findCall = mockModel.find.mock.calls[0][0];
      const andCond = findCall.$and?.find((c: any) => c.$or?.some((o: any) => 'availability.status' in o || !('availability.status' in o)));
      expect(andCond).toBeDefined();
    });

    it('should filter by non-AVAILABLE availability directly', async () => {
      buildFindMock();
      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { availability: PlayerAvailabilityEnum.INJURED },
      });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall['availability.status']).toBe(PlayerAvailabilityEnum.INJURED);
    });

    it('should apply availableForTraining filter', async () => {
      buildFindMock();
      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { availableForTraining: true },
      });

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.$and).toBeDefined();
      const orCond = findCall.$and.find((c: any) => c.$or?.some((o: any) => o['availability.status'] === PlayerAvailabilityEnum.INJURED));
      expect(orCond).toBeDefined();
    });

    it('should apply sortBy and sortOrder', async () => {
      buildFindMock();
      const findChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(playersArray),
      };
      mockModel.find.mockReturnValue(findChain);

      await service.findPaginated({ page: 1, size: 10, sortBy: 'name', sortOrder: SortOrder.DESC });

      expect(findChain.sort).toHaveBeenCalledWith({ name: -1 });
    });

    it('should restrict scope for non-admin caller with sports/categories', async () => {
      buildFindMock();
      const caller = {
        roles: [RoleEnum.MANAGER],
        sports: [SportEnum.RUGBY],
        categories: ['sub18'],
        branches: undefined,
      } as any;

      await service.findPaginated({ page: 1, size: 10 }, caller);

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.sport).toEqual({ $in: [SportEnum.RUGBY] });
      expect(findCall.category).toEqual({ $in: ['sub18'] });
    });

    it('should restrict scope for non-admin caller with branches', async () => {
      buildFindMock();
      const caller = {
        roles: [RoleEnum.MANAGER],
        sports: undefined,
        categories: undefined,
        branches: ['A', 'B'],
      } as any;

      await service.findPaginated({ page: 1, size: 10 }, caller);

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.branch).toEqual({ $in: ['A', 'B'] });
    });

    it('should NOT restrict scope for admin caller', async () => {
      buildFindMock();
      const adminCaller = {
        roles: [RoleEnum.ADMIN],
        sports: [SportEnum.RUGBY],
      } as any;

      await service.findPaginated({ page: 1, size: 10 }, adminCaller);

      const findCall = mockModel.find.mock.calls[0][0];
      expect(findCall.sport).toBeUndefined();
    });

    it('should use aggregate pipeline when searchTerm is provided', async () => {
      mockModel.aggregate.mockResolvedValueOnce(playersArray);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(3) });

      const result = await service.findPaginated({
        page: 1,
        size: 10,
        filters: { searchTerm: 'Martin' },
      });

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result.items).toEqual(playersArray);
    });
  });

  // ---------------------------------------------------------------------------
  // getFieldOptions()
  // ---------------------------------------------------------------------------
  describe('getFieldOptions()', () => {
    it('should return health insurance options', async () => {
      mockModel.distinct = jest.fn().mockReturnValue(
        Promise.resolve(['OSDE', null, 'Swiss Medical', ''])
      );

      const result = await service.getFieldOptions();

      expect(mockModel.distinct).toHaveBeenCalledWith('medicalData.healthInsurance');
      expect(result.healthInsurances).toEqual(['OSDE', 'Swiss Medical']);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne()
  // ---------------------------------------------------------------------------
  describe('findOne()', () => {
    it('should return a player by id', async () => {
      mockModel.findById.mockResolvedValueOnce(mockPlayer);
      const result = await service.findOne('player-id-1');
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findByUserId()
  // ---------------------------------------------------------------------------
  describe('findByUserId()', () => {
    it('should return a player matched by userId', async () => {
      mockModel.findOne.mockResolvedValueOnce(mockPlayer);
      const result = await service.findByUserId('507f1f77bcf86cd799439011');
      expect(mockModel.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockPlayer);
    });

    it('should return null when no player found for userId', async () => {
      mockModel.findOne.mockResolvedValueOnce(null);
      const result = await service.findByUserId('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // updateSelf()
  // ---------------------------------------------------------------------------
  describe('updateSelf()', () => {
    it('should throw NotFoundException when no player is linked to the user', async () => {
      mockModel.findOne.mockResolvedValueOnce(null);
      await expect(
        service.updateSelf('507f1f77bcf86cd799439011', {})
      ).rejects.toThrow(NotFoundException);
    });

    it('should update address and save', async () => {
      const player = {
        ...mockPlayer,
        address: { phoneNumber: '000' },
        clothingSizes: {},
        save: jest.fn().mockResolvedValue(mockPlayer),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      await service.updateSelf('507f1f77bcf86cd799439011', {
        address: { phoneNumber: '999' },
      });

      expect(player.address.phoneNumber).toBe('999');
      expect(player.save).toHaveBeenCalled();
    });

    it('should update clothingSizes and save', async () => {
      const player = {
        ...mockPlayer,
        address: { phoneNumber: '000' },
        clothingSizes: { jersey: ClothingSizesEnum.M },
        save: jest.fn().mockResolvedValue(mockPlayer),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      await service.updateSelf('507f1f77bcf86cd799439011', {
        clothingSizes: { jersey: ClothingSizesEnum.L },
      });

      expect(player.clothingSizes.jersey).toBe(ClothingSizesEnum.L);
      expect(player.save).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getPhotoStream()
  // ---------------------------------------------------------------------------
  describe('getPhotoStream()', () => {
    it('should return a file stream from GridFS', async () => {
      const fakeStream = {};
      mockGridFs.getFileStream.mockResolvedValueOnce(fakeStream);

      const result = await service.getPhotoStream('photo-id-123');

      expect(mockGridFs.getFileStream).toHaveBeenCalledWith(
        'playersPhotos',
        'photo-id-123'
      );
      expect(result).toBe(fakeStream);
    });
  });

  // ---------------------------------------------------------------------------
  // updateAvailability()
  // ---------------------------------------------------------------------------
  describe('updateAvailability()', () => {
    it('should throw NotFoundException when player not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(
        service.updateAvailability('bad-id', { status: PlayerAvailabilityEnum.INJURED })
      ).rejects.toThrow(NotFoundException);
    });

    it('should update availability and save', async () => {
      const player = {
        ...mockPlayer,
        availability: undefined,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.updateAvailability('player-id-1', {
        status: PlayerAvailabilityEnum.INJURED,
        reason: 'Knee',
        since: '2024-01-01',
        estimatedReturn: '2024-03-01',
      });

      expect(player.availability.status).toBe(PlayerAvailabilityEnum.INJURED);
      expect(player.availability.reason).toBe('Knee');
      expect(player.save).toHaveBeenCalled();
    });

    it('should update availability without optional date fields', async () => {
      const player = {
        ...mockPlayer,
        availability: undefined,
        save: jest.fn().mockResolvedValue(mockPlayer),
        markModified: jest.fn(),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.updateAvailability('player-id-1', {
        status: PlayerAvailabilityEnum.AVAILABLE,
      });

      expect(player.availability.status).toBe(PlayerAvailabilityEnum.AVAILABLE);
      expect(player.availability.since).toBeUndefined();
      expect(player.availability.estimatedReturn).toBeUndefined();
      expect(player.save).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // delete()
  // ---------------------------------------------------------------------------
  describe('delete()', () => {
    it('should delete a player without photo', async () => {
      const player = {
        ...mockPlayer,
        photoId: undefined,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.delete('player-id-1');

      expect(mockGridFs.deleteFile).not.toHaveBeenCalled();
      expect(player.deleteOne).toHaveBeenCalled();
    });

    it('should delete photo from GridFS before deleting player', async () => {
      const player = {
        ...mockPlayer,
        photoId: 'photo-to-delete',
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      mockModel.findById.mockResolvedValueOnce(player);

      await service.delete('player-id-1');

      expect(mockGridFs.deleteFile).toHaveBeenCalledWith(
        'playersPhotos',
        'photo-to-delete'
      );
      expect(player.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when player not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // getStats()
  // ---------------------------------------------------------------------------
  describe('getStats()', () => {
    it('should return stats grouped by category', async () => {
      mockModel.aggregate.mockResolvedValueOnce([
        { _id: { category: 'sub18', sport: SportEnum.RUGBY }, count: 10 },
        { _id: { category: 'plantel_superior', sport: SportEnum.RUGBY }, count: 5 },
        { _id: { category: 'plantel_superior', sport: SportEnum.HOCKEY }, count: 3 },
      ]);

      const result = await service.getStats();

      expect(result.total).toBe(18);
      expect(result.byCategory['sub18']).toBe(10);
      expect(result.byCategory['plantel_superior:rugby']).toBe(5);
      expect(result.byCategory['plantel_superior:hockey']).toBe(3);
    });

    it('should restrict by sport/category for non-admin caller', async () => {
      mockModel.aggregate.mockResolvedValueOnce([]);
      const caller = {
        roles: [RoleEnum.MANAGER],
        sports: [SportEnum.RUGBY],
        categories: ['sub18'],
      } as any;

      await service.getStats(caller);

      const aggregateCall = mockModel.aggregate.mock.calls[0][0];
      const matchStage = aggregateCall[0].$match;
      expect(matchStage.sport).toEqual({ $in: [SportEnum.RUGBY] });
      expect(matchStage.category).toEqual({ $in: ['sub18'] });
    });

    it('should NOT restrict scope for admin caller', async () => {
      mockModel.aggregate.mockResolvedValueOnce([]);
      const adminCaller = {
        roles: [RoleEnum.ADMIN],
        sports: [SportEnum.RUGBY],
      } as any;

      await service.getStats(adminCaller);

      const aggregateCall = mockModel.aggregate.mock.calls[0][0];
      const matchStage = aggregateCall[0].$match;
      expect(matchStage.sport).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // importFromFile()
  // ---------------------------------------------------------------------------
  describe('importFromFile()', () => {
    const xlsxRead = XLSX.read as jest.Mock;
    const xlsxSheetToJson = XLSX.utils.sheet_to_json as jest.Mock;

    const setupXlsx = (sheetName: string, rows: any[]) => {
      xlsxRead.mockReturnValueOnce({
        SheetNames: [sheetName],
        Sheets: { [sheetName]: {} },
      });
      xlsxSheetToJson.mockReturnValueOnce(rows);
    };

    it('should return zero counts when all sheets are ignored (unknown sport)', async () => {
      xlsxRead.mockReturnValueOnce({
        SheetNames: ['Plantilla'],
        Sheets: { Plantilla: {} },
      });

      const result = await service.importFromFile(Buffer.from(''));
      expect(result).toEqual({ created: 0, updated: 0, errors: [] });
    });

    it('should report error when Nombre is missing', async () => {
      setupXlsx('Rugby', [{ Nombre: '', 'N° Doc.': '123', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'RM' }]);

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/Nombre/);
    });

    it('should report error when N° Doc. is missing', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'RM' }]);

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/N° Doc/);
    });

    it('should report error when Fecha Nac. is invalid', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '12345', 'Fecha Nac.': null, Categoría: 'RM' }]);

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/Fecha Nac/);
    });

    it('should report error when Categoría is unknown', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '12345', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'UNKNOWN_CAT' }]);

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/Categoría desconocida/);
    });

    it('should create player when not existing', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '12345', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'RM', Socio: 100 }]);

      mockModel.findOne.mockResolvedValueOnce(null);
      mockModel.create.mockResolvedValueOnce({ _id: 'new-id' });

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
    });

    it('should update player when already exists by idNumber', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '12345', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'HM' }]);

      mockModel.findOne.mockResolvedValueOnce({ _id: 'existing-id' });
      mockModel.findByIdAndUpdate.mockResolvedValueOnce({});

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
    });

    it('should record error for row when db throws', async () => {
      setupXlsx('Rugby', [{ Nombre: 'Juan Perez', 'N° Doc.': '12345', 'Fecha Nac.': new Date('2000-01-01'), Categoría: 'RM' }]);

      mockModel.findOne.mockRejectedValueOnce(new Error('db error'));

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/db error/);
    });

    it('should process rows from the HCM category (calculated from age)', async () => {
      setupXlsx('Hockey', [{ Nombre: 'Ana Lopez', 'N° Doc.': '99999', 'Fecha Nac.': new Date('2008-01-01'), Categoría: 'HCM' }]);

      mockModel.findOne.mockResolvedValueOnce(null);
      mockModel.create.mockResolvedValueOnce({ _id: 'new-id' });

      const result = await service.importFromFile(Buffer.from(''));
      expect(result.created).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // updateFromSurvey()
  // ---------------------------------------------------------------------------
  describe('updateFromSurvey()', () => {
    const xlsxRead = XLSX.read as jest.Mock;
    const xlsxSheetToJson = XLSX.utils.sheet_to_json as jest.Mock;

    const setupXlsx = (rows: any[]) => {
      xlsxRead.mockReturnValueOnce({
        SheetNames: ['Hoja1'],
        Sheets: { Hoja1: {} },
      });
      xlsxSheetToJson.mockReturnValueOnce(rows);
    };

    it('should report error when DNI is empty', async () => {
      setupXlsx([{ DNI: '', Nombre: 'Juan', Apellido: 'Perez' }]);

      const result = await service.updateFromSurvey(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/DNI vacío/);
    });

    it('should add to notFound when player with DNI does not exist', async () => {
      setupXlsx([{ DNI: '12345', Nombre: 'Juan', Apellido: 'Perez' }]);

      mockModel.findOne.mockResolvedValueOnce(null);

      const result = await service.updateFromSurvey(Buffer.from(''));
      expect(result.notFound.length).toBe(1);
      expect(result.notFound[0].dni).toBe('12345');
    });

    it('should update phone and health insurance for existing player', async () => {
      setupXlsx([{
        DNI: '12345',
        Nombre: 'Juan',
        Apellido: 'Perez',
        Telefono: '555-1234',
        'Obra Social': 'OSDE',
        'Talle Camiseta': 'L',
        'Talle Short/Falda': 'M',
        'Correo Electrónico': 'juan@mail.com',
      }]);

      const player = {
        ...mockPlayer,
        address: { phoneNumber: '' },
        medicalData: {} as Record<string, any>,
        clothingSizes: {} as Record<string, any>,
        email: undefined as any,
        save: jest.fn().mockResolvedValue(mockPlayer),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      const result = await service.updateFromSurvey(Buffer.from(''));
      expect(result.updated).toBe(1);
      expect(player.address.phoneNumber).toBe('555-1234');
      expect((player.medicalData as any).healthInsurance).toBe('OSDE');
      expect((player.clothingSizes as any).jersey).toBe('L');
      expect(player.email).toBe('juan@mail.com');
    });

    it('should not overwrite existing email', async () => {
      setupXlsx([{ DNI: '12345', Nombre: 'Juan', Apellido: 'Perez', 'Correo Electrónico': 'new@mail.com' }]);

      const player = {
        ...mockPlayer,
        email: 'existing@mail.com',
        save: jest.fn().mockResolvedValue(mockPlayer),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      await service.updateFromSurvey(Buffer.from(''));
      expect(player.email).toBe('existing@mail.com');
    });

    it('should record error when save throws', async () => {
      setupXlsx([{ DNI: '12345', Nombre: 'Juan', Apellido: 'Perez' }]);

      const player = {
        ...mockPlayer,
        save: jest.fn().mockRejectedValue(new Error('save failed')),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      const result = await service.updateFromSurvey(Buffer.from(''));
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toMatch(/save failed/);
    });

    it('should skip invalid health insurance values like "-" or "."', async () => {
      setupXlsx([{ DNI: '12345', Nombre: 'Juan', Apellido: 'Perez', 'Obra Social': '-' }]);

      const player = {
        ...mockPlayer,
        medicalData: {} as Record<string, any>,
        save: jest.fn().mockResolvedValue(mockPlayer),
      };
      mockModel.findOne.mockResolvedValueOnce(player);

      await service.updateFromSurvey(Buffer.from(''));
      expect((player.medicalData as any).healthInsurance).toBeUndefined();
    });
  });
});
