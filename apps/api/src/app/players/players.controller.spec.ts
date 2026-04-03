import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';
import { plainToClass } from 'class-transformer';
import {
  createPlayerDtoPlain,
  playersArray,
} from '../shared/mocks/playerMocks';
import { Response } from 'express';
import { Readable } from 'stream';
import { PlayerAvailabilityEnum, RoleEnum } from '@ltrc-campo/shared-api-model';
import type { File as MulterFile } from 'multer';

const mockPlayer = { ...playersArray[0], id: '1', photoId: 'photo-1' };

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: jest.Mocked<PlayersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: {
            findPaginated: jest.fn().mockResolvedValue({
              items: playersArray,
              total: playersArray.length,
              page: 1,
              size: 10,
            }),
            create: jest
              .fn()
              .mockImplementation((dto: CreatePlayerDto) =>
                Promise.resolve({ _id: '1', ...dto })
              ),
            update: jest.fn().mockResolvedValue(mockPlayer),
            findOne: jest.fn().mockResolvedValue(mockPlayer),
            findByUserId: jest.fn().mockResolvedValue(mockPlayer),
            getPhotoStream: jest.fn().mockResolvedValue(Readable.from(['img'])),
            delete: jest.fn().mockResolvedValue(mockPlayer),
            getStats: jest.fn().mockResolvedValue({ byCategory: {}, total: 0 }),
            getFieldOptions: jest.fn().mockResolvedValue({ healthInsurances: [] }),
            updateAvailability: jest.fn().mockResolvedValue(mockPlayer),
            updateSelf: jest.fn().mockResolvedValue(mockPlayer),
            importFromFile: jest.fn().mockResolvedValue({ created: 1, updated: 0, errors: [] }),
            updateFromSurvey: jest.fn().mockResolvedValue({ updated: 1, notFound: [], errors: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get(PlayersController);
    service = module.get(PlayersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // create()
  // ---------------------------------------------------------------------------
  describe('create()', () => {
    it('should create a new player', () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      expect(controller.create(dto)).resolves.toEqual({ _id: '1', ...dto });
    });

    it('should pass photo and caller user to service', async () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      const photo = { originalname: 'p.jpg' } as MulterFile;
      const req = { user: { _id: 'u1', roles: [RoleEnum.ADMIN] } } as any;

      await controller.create(dto, photo, req);

      expect(service.create).toHaveBeenCalledWith(dto, photo, req.user);
    });
  });

  // ---------------------------------------------------------------------------
  // findPaginated()
  // ---------------------------------------------------------------------------
  describe('findPaginated()', () => {
    it('should return a paginated response', () => {
      const mockReq = { user: { roles: [] } } as any;
      expect(controller.findPaginated({ page: 1, size: 10 }, mockReq)).resolves.toEqual({
        items: playersArray,
        total: playersArray.length,
        page: 1,
        size: 10,
      });
    });

    it('should forward the caller user to service', async () => {
      const mockReq = { user: { roles: [RoleEnum.MANAGER] } } as any;
      await controller.findPaginated({ page: 1, size: 10 }, mockReq);
      expect(service.findPaginated).toHaveBeenCalledWith(
        { page: 1, size: 10 },
        mockReq.user
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getOne()
  // ---------------------------------------------------------------------------
  describe('getOne()', () => {
    it('should return a single player', async () => {
      const result = await controller.getOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPlayer);
    });

    it('should propagate NotFoundException from service', () => {
      service.findOne.mockRejectedValueOnce(new NotFoundException());
      expect(controller.getOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ---------------------------------------------------------------------------
  // update()
  // ---------------------------------------------------------------------------
  describe('update()', () => {
    it('should update a player', async () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith('1', dto, undefined, undefined);
      expect(result).toEqual(mockPlayer);
    });

    it('should pass photo and caller to service on update', async () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      const photo = { originalname: 'p.jpg' } as MulterFile;
      const req = { user: { _id: 'u1', roles: [RoleEnum.ADMIN] } } as any;

      await controller.update('1', dto, photo, req);

      expect(service.update).toHaveBeenCalledWith('1', dto, photo, req.user);
    });
  });

  // ---------------------------------------------------------------------------
  // delete()
  // ---------------------------------------------------------------------------
  describe('delete()', () => {
    it('should delete a player', async () => {
      const result = await controller.delete('1');
      expect(service.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPlayer);
    });

    it('should propagate NotFoundException from service', () => {
      service.delete.mockRejectedValueOnce(new NotFoundException());
      expect(controller.delete('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getPhoto()
  // ---------------------------------------------------------------------------
  describe('getPhoto()', () => {
    it('should pipe photo stream to response', async () => {
      const res = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as unknown as Response;

      const stream = Readable.from(['img-data']);
      stream.pipe = jest.fn();
      service.getPhotoStream.mockResolvedValueOnce(stream as any);

      await controller.getPhoto('1', res);

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(service.getPhotoStream).toHaveBeenCalledWith('photo-1');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(stream.pipe).toHaveBeenCalledWith(res);
    });

    it('should throw NotFoundException when player has no photo', async () => {
      service.findOne.mockResolvedValueOnce({
        ...mockPlayer,
        photoId: undefined,
      } as any);
      const res = {} as Response;
      await expect(controller.getPhoto('1', res)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findByUserId()
  // ---------------------------------------------------------------------------
  describe('findByUserId()', () => {
    it('should return the player for a given userId', async () => {
      const result = await controller.findByUserId('user-123');
      expect(service.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockPlayer);
    });
  });

  // ---------------------------------------------------------------------------
  // getMyPlayer()
  // ---------------------------------------------------------------------------
  describe('getMyPlayer()', () => {
    it('should return the linked player for the authenticated user', async () => {
      const req = { user: { _id: { toString: () => 'user-id-1' } } } as any;
      const result = await controller.getMyPlayer(req);
      expect(service.findByUserId).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException when no player is linked to the user', async () => {
      service.findByUserId.mockResolvedValueOnce(null as any);
      const req = { user: { _id: { toString: () => 'unknown-user' } } } as any;
      await expect(controller.getMyPlayer(req)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // updateMyProfile()
  // ---------------------------------------------------------------------------
  describe('updateMyProfile()', () => {
    it('should call updateSelf with the user id and dto', async () => {
      const req = { user: { _id: { toString: () => 'user-id-1' } } } as any;
      const dto = { address: { phoneNumber: '555' } } as any;

      const result = await controller.updateMyProfile(dto, req);

      expect(service.updateSelf).toHaveBeenCalledWith('user-id-1', dto);
      expect(result).toEqual(mockPlayer);
    });
  });

  // ---------------------------------------------------------------------------
  // getStats()
  // ---------------------------------------------------------------------------
  describe('getStats()', () => {
    it('should return player stats', async () => {
      const req = { user: { roles: [RoleEnum.ADMIN] } } as any;
      const result = await controller.getStats(req);
      expect(service.getStats).toHaveBeenCalledWith(req.user);
      expect(result).toEqual({ byCategory: {}, total: 0 });
    });
  });

  // ---------------------------------------------------------------------------
  // getFieldOptions()
  // ---------------------------------------------------------------------------
  describe('getFieldOptions()', () => {
    it('should return field options', async () => {
      const result = await controller.getFieldOptions();
      expect(service.getFieldOptions).toHaveBeenCalled();
      expect(result).toEqual({ healthInsurances: [] });
    });
  });

  // ---------------------------------------------------------------------------
  // updateAvailability()
  // ---------------------------------------------------------------------------
  describe('updateAvailability()', () => {
    it('should update player availability', async () => {
      const dto = { status: PlayerAvailabilityEnum.INJURED, reason: 'Knee' };
      const result = await controller.updateAvailability('1', dto);
      expect(service.updateAvailability).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(mockPlayer);
    });

    it('should propagate NotFoundException when player not found', async () => {
      service.updateAvailability.mockRejectedValueOnce(new NotFoundException());
      await expect(
        controller.updateAvailability('bad-id', { status: PlayerAvailabilityEnum.INJURED })
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // importFromFile()
  // ---------------------------------------------------------------------------
  describe('importFromFile()', () => {
    it('should call importFromFile with the file buffer', async () => {
      const file = { buffer: Buffer.from('xlsx-content') } as MulterFile;
      const result = await controller.importFromFile(file);
      expect(service.importFromFile).toHaveBeenCalledWith(file.buffer);
      expect(result).toEqual({ created: 1, updated: 0, errors: [] });
    });
  });

  // ---------------------------------------------------------------------------
  // updateFromSurvey()
  // ---------------------------------------------------------------------------
  describe('updateFromSurvey()', () => {
    it('should call updateFromSurvey with the file buffer', async () => {
      const file = { buffer: Buffer.from('xlsx-survey') } as MulterFile;
      const result = await controller.updateFromSurvey(file);
      expect(service.updateFromSurvey).toHaveBeenCalledWith(file.buffer);
      expect(result).toEqual({ updated: 1, notFound: [], errors: [] });
    });
  });
});
