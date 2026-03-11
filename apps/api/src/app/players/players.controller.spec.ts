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
            getPhotoStream: jest.fn().mockResolvedValue(Readable.from(['img'])),
            delete: jest.fn().mockResolvedValue(mockPlayer),
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

  describe('create()', () => {
    it('should create a new player', () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      expect(controller.create(dto)).resolves.toEqual({ _id: '1', ...dto });
    });
  });

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
  });

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

  describe('update()', () => {
    it('should update a player', async () => {
      const dto = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
      const result = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith('1', dto, undefined);
      expect(result).toEqual(mockPlayer);
    });
  });

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
});
