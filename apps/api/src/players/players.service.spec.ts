import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { PlayersService } from './players.service';
import { PLAYER_MODEL } from '../shared/constants';
import { createPlayerDtoPlain, playersArray } from '../shared/mocks/playerMocks';
import { plainToClass } from 'class-transformer';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Player } from '@ltrc-ps/shared-api-model';

describe('PlayersService', () => {
  let service: PlayersService;
  let model: Model<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: PLAYER_MODEL,
          useValue: {
            new: jest.fn().mockResolvedValue(createPlayerDtoPlain),
            constructor: jest.fn().mockResolvedValue(createPlayerDtoPlain),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PlayersService);
    model = module.get<Model<Player>>(PLAYER_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all players', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(playersArray),
    } as any);
    const cats = await service.findAll();
    expect(cats).toEqual(playersArray);
  });

  it('should insert a new player', async () => {
    jest
      .spyOn(model, 'create')
      .mockImplementationOnce(() =>
        Promise.resolve({ _id: '1', ...createPlayerDtoPlain } as any)
      );

    const payload = plainToClass(CreatePlayerDto, createPlayerDtoPlain);
    const newPlayer = await service.create(payload);
    expect(newPlayer).toEqual({ _id: '1', ...createPlayerDtoPlain });
  });
});
