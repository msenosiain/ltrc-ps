import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import {
  TripStatusEnum,
  TripParticipantTypeEnum,
  TripParticipantStatusEnum,
  TransportTypeEnum,
} from '@ltrc-campo/shared-api-model';

const mockTrip = {
  id: 'trip-1',
  name: 'Gira Córdoba',
  destination: 'Córdoba',
  departureDate: new Date('2026-07-10'),
  costPerPerson: 5000,
  status: TripStatusEnum.OPEN,
  participants: [],
  transports: [],
};

const mockService = {
  create: jest.fn().mockResolvedValue(mockTrip),
  findPaginated: jest.fn().mockResolvedValue({ items: [mockTrip], total: 1, page: 1, size: 10 }),
  findOne: jest.fn().mockResolvedValue(mockTrip),
  update: jest.fn().mockResolvedValue(mockTrip),
  delete: jest.fn().mockResolvedValue(undefined),
  addParticipant: jest.fn().mockResolvedValue(mockTrip),
  updateParticipant: jest.fn().mockResolvedValue(mockTrip),
  removeParticipant: jest.fn().mockResolvedValue(mockTrip),
  recordPayment: jest.fn().mockResolvedValue(mockTrip),
  removePayment: jest.fn().mockResolvedValue(mockTrip),
  addTransport: jest.fn().mockResolvedValue(mockTrip),
  updateTransport: jest.fn().mockResolvedValue(mockTrip),
  removeTransport: jest.fn().mockResolvedValue(mockTrip),
  draftTransportAssignment: jest.fn().mockResolvedValue(mockTrip),
  moveParticipant: jest.fn().mockResolvedValue(mockTrip),
};

const mockReq = { user: { _id: 'user-1', roles: ['admin'] } };

describe('TripsController', () => {
  let controller: TripsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [{ provide: TripsService, useValue: mockService }],
    })
      .overrideGuard(require('../auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(TripsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll() should call findPaginated', async () => {
    const result = await controller.findAll({ page: 1, size: 10 }, mockReq as any);
    expect(mockService.findPaginated).toHaveBeenCalledWith({ page: 1, size: 10 }, mockReq.user);
    expect(result.items).toHaveLength(1);
  });

  it('create() should call service.create', async () => {
    const dto = {
      name: 'Gira Córdoba',
      destination: 'Córdoba',
      departureDate: '2026-07-10',
      costPerPerson: 5000,
    };
    const result = await controller.create(dto, mockReq as any);
    expect(mockService.create).toHaveBeenCalledWith(dto, mockReq.user);
    expect(result).toEqual(mockTrip);
  });

  it('findOne() should call service.findOne', async () => {
    const result = await controller.findOne('trip-1');
    expect(mockService.findOne).toHaveBeenCalledWith('trip-1');
    expect(result).toEqual(mockTrip);
  });

  it('update() should call service.update', async () => {
    await controller.update('trip-1', { name: 'Gira Rosario' }, mockReq as any);
    expect(mockService.update).toHaveBeenCalledWith('trip-1', { name: 'Gira Rosario' }, mockReq.user);
  });

  it('delete() should call service.delete', async () => {
    await controller.delete('trip-1');
    expect(mockService.delete).toHaveBeenCalledWith('trip-1');
  });

  it('addParticipant() should call service.addParticipant', async () => {
    const dto = { type: TripParticipantTypeEnum.PLAYER, playerId: 'p-1' };
    await controller.addParticipant('trip-1', dto, mockReq as any);
    expect(mockService.addParticipant).toHaveBeenCalledWith('trip-1', dto, mockReq.user);
  });

  it('recordPayment() should call service.recordPayment', async () => {
    const dto = { amount: 2000, date: '2026-06-01' };
    await controller.recordPayment('trip-1', 'p-1', dto, mockReq as any);
    expect(mockService.recordPayment).toHaveBeenCalledWith('trip-1', 'p-1', dto, mockReq.user);
  });

  it('addTransport() should call service.addTransport', async () => {
    const dto = { name: 'Micro 1', type: TransportTypeEnum.BUS, capacity: 40 };
    await controller.addTransport('trip-1', dto, mockReq as any);
    expect(mockService.addTransport).toHaveBeenCalledWith('trip-1', dto, mockReq.user);
  });

  it('draftTransportAssignment() should call service', async () => {
    await controller.draftTransportAssignment('trip-1', mockReq as any);
    expect(mockService.draftTransportAssignment).toHaveBeenCalledWith('trip-1', mockReq.user);
  });
});
