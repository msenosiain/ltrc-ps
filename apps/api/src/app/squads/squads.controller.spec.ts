import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SquadsController } from './squads.controller';
import { SquadsService } from './squads.service';

const mockSquad = { id: 'squad-1', name: 'Equipo Titular', players: [] };

const mockService = {
  findAll: jest.fn().mockResolvedValue([mockSquad]),
  create: jest.fn().mockResolvedValue(mockSquad),
  findOne: jest.fn().mockResolvedValue(mockSquad),
  update: jest.fn().mockResolvedValue(mockSquad),
  delete: jest.fn().mockResolvedValue(mockSquad),
};

describe('SquadsController', () => {
  let controller: SquadsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SquadsController],
      providers: [{ provide: SquadsService, useValue: mockService }],
    }).compile();
    controller = module.get(SquadsController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll() should return all squads', async () => {
    expect(await controller.findAll()).toEqual([mockSquad]);
  });

  it('create() should create a squad', async () => {
    const dto = { name: 'Equipo Titular', players: [] };
    expect(await controller.create(dto)).toEqual(mockSquad);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('getOne() should return a squad', async () => {
    expect(await controller.getOne('squad-1')).toEqual(mockSquad);
  });

  it('getOne() should propagate NotFoundException', async () => {
    mockService.findOne.mockRejectedValueOnce(new NotFoundException());
    await expect(controller.getOne('bad-id')).rejects.toThrow(
      NotFoundException
    );
  });

  it('update() should update a squad', async () => {
    expect(await controller.update('squad-1', { name: 'Suplentes' })).toEqual(
      mockSquad
    );
    expect(mockService.update).toHaveBeenCalledWith('squad-1', {
      name: 'Suplentes',
    });
  });

  it('delete() should delete a squad', async () => {
    expect(await controller.delete('squad-1')).toEqual(mockSquad);
    expect(mockService.delete).toHaveBeenCalledWith('squad-1');
  });
});
