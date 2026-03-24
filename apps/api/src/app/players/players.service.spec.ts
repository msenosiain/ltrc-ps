import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
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

const mockPlayer = {
  ...playersArray[0],
  id: 'player-id-1',
  photoId: undefined as string | undefined,
  save: jest.fn(),
  deleteOne: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
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

  describe('create()', () => {
    const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);

    it('should create a player without photo', async () => {
      mockModel.create.mockResolvedValueOnce({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        photoId: undefined,
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
      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        photoId: 'gridfs-id-123',
      });
      expect(result).toMatchObject({ photoId: 'gridfs-id-123' });
    });
  });

  describe('update()', () => {
    it('should update an existing player', async () => {
      const player = {
        ...mockPlayer,
        save: jest.fn().mockResolvedValue(mockPlayer),
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
        save: jest.fn().mockResolvedValue(mockPlayer),
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
  });

  describe('findPaginated()', () => {
    it('should return paginated players', async () => {
      const execMock = jest.fn().mockResolvedValue(playersArray);
      const countMock = jest.fn().mockResolvedValue(playersArray.length);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockReturnValue({ exec: countMock });

      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(result.items).toEqual(playersArray);
      expect(result.total).toBe(playersArray.length);
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });
  });

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
});
