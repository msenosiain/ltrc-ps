import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';
import { plainToClass } from 'class-transformer';
import {
  createPlayerDtoPlain,
  playersArray,
} from '../shared/mocks/playerMocks';
describe('PlayersController', () => {
  let controller: PlayersController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: {
            findPaginated: jest
              .fn()
              .mockResolvedValue({
                items: playersArray,
                total: playersArray.length,
                page: 1,
                size: 10,
              }),
            create: jest
              .fn()
              .mockImplementation((createPlayerDto: CreatePlayerDto) =>
                Promise.resolve({ _id: '1', ...createPlayerDto })
              ),
          },
        },
      ],
    }).compile();
    controller = module.get(PlayersController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create()', () => {
    it('should create a new player', () => {
      const createPlayerDto = plainToClass(
        CreatePlayerDto,
        createPlayerDtoPlain
      );
      expect(controller.create(createPlayerDto)).resolves.toEqual({
        _id: '1',
        ...createPlayerDto,
      });
    });
  });
  describe('findPaginated()', () => {
    it('should get a paginated response of players', () => {
      expect(controller.findPaginated({ page: 1, size: 10 })).resolves.toEqual({
        items: playersArray,
        total: playersArray.length,
        page: 1,
        size: 10,
      });
    });
  });
});
