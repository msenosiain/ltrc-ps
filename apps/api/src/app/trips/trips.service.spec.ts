import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripEntity } from './schemas/trip.entity';
import {
  TripStatusEnum,
  TripParticipantTypeEnum,
  TripParticipantStatusEnum,
  TransportTypeEnum,
  CategoryEnum,
} from '@ltrc-campo/shared-api-model';
import { Types } from 'mongoose';

const makeParticipant = (overrides: Partial<any> = {}): any => ({
  _id: new Types.ObjectId(),
  type: TripParticipantTypeEnum.PLAYER,
  status: TripParticipantStatusEnum.CONFIRMED,
  costAssigned: 5000,
  payments: [],
  player: { category: CategoryEnum.M10 },
  transportId: undefined as Types.ObjectId | undefined,
  deleteOne: jest.fn(),
  ...overrides,
});

const makeTransport = (overrides: Partial<any> = {}) => ({
  _id: new Types.ObjectId(),
  name: 'Micro 1',
  type: TransportTypeEnum.BUS,
  capacity: 40,
  deleteOne: jest.fn(),
  ...overrides,
});

const mockTrip = {
  id: 'trip-1',
  name: 'Gira Córdoba',
  destination: 'Córdoba',
  departureDate: new Date('2026-07-10'),
  costPerPerson: 5000,
  status: TripStatusEnum.OPEN,
  participants: [],
  transports: [],
  save: jest.fn(),
  deleteOne: jest.fn(),
};

const mockModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
};

describe('TripsService', () => {
  let service: TripsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: getModelToken(TripEntity.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get(TripsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a trip', async () => {
      mockModel.create.mockResolvedValueOnce(mockTrip);
      const result = await service.create({
        name: 'Gira Córdoba',
        destination: 'Córdoba',
        departureDate: '2026-07-10',
        costPerPerson: 5000,
      });
      expect(mockModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockTrip);
    });
  });

  describe('findPaginated()', () => {
    it('should return paginated trips', async () => {
      const execMock = jest.fn().mockResolvedValue([mockTrip]);
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await service.findPaginated({ page: 1, size: 10 });

      expect(result.items).toEqual([mockTrip]);
      expect(result.total).toBe(1);
    });

    it('should apply status filter', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: execMock,
      });
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findPaginated({
        page: 1,
        size: 10,
        filters: { status: TripStatusEnum.OPEN },
      });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: TripStatusEnum.OPEN })
      );
    });
  });

  describe('findOne()', () => {
    it('should return a trip by id', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTrip),
      });
      const result = await service.findOne('trip-1');
      expect(result).toEqual(mockTrip);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update a trip', async () => {
      const trip = { ...mockTrip, save: jest.fn().mockResolvedValue(mockTrip) };
      mockModel.findById.mockResolvedValueOnce(trip);

      await service.update('trip-1', { name: 'Gira Rosario' });

      expect(trip.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete()', () => {
    it('should delete a trip', async () => {
      const trip = { ...mockTrip, deleteOne: jest.fn().mockResolvedValue(true) };
      mockModel.findById.mockResolvedValueOnce(trip);

      await service.delete('trip-1');

      expect(trip.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValueOnce(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addParticipant()', () => {
    it('should add a player participant', async () => {
      const playerId = new Types.ObjectId().toHexString();
      const trip = {
        ...mockTrip,
        participants: { some: jest.fn().mockReturnValue(false), push: jest.fn() },
        save: jest.fn().mockResolvedValue({}),
      };
      mockModel.findById.mockResolvedValueOnce(trip);
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await service.addParticipant('trip-1', {
        type: TripParticipantTypeEnum.PLAYER,
        playerId,
      });

      expect(trip.participants.push).toHaveBeenCalledWith(
        expect.objectContaining({ type: TripParticipantTypeEnum.PLAYER })
      );
    });

    it('should throw when player already added', async () => {
      const playerId = new Types.ObjectId().toHexString();
      const trip = {
        ...mockTrip,
        participants: { some: jest.fn().mockReturnValue(true), push: jest.fn() },
      };
      mockModel.findById.mockResolvedValueOnce(trip);

      await expect(
        service.addParticipant('trip-1', {
          type: TripParticipantTypeEnum.PLAYER,
          playerId,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should add an external participant', async () => {
      const trip = {
        ...mockTrip,
        participants: { some: jest.fn().mockReturnValue(false), push: jest.fn() },
        save: jest.fn().mockResolvedValue({}),
      };
      mockModel.findById.mockResolvedValueOnce(trip);
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await service.addParticipant('trip-1', {
        type: TripParticipantTypeEnum.EXTERNAL,
        externalName: 'Juan Pérez',
        externalDni: '12345678',
        externalRole: 'Padre de Martín',
      });

      expect(trip.participants.push).toHaveBeenCalledWith(
        expect.objectContaining({ type: TripParticipantTypeEnum.EXTERNAL })
      );
    });
  });

  describe('recordPayment()', () => {
    it('should record a payment and return updated trip', async () => {
      const participantId = new Types.ObjectId();
      const participant = makeParticipant({ _id: participantId, payments: [] });
      const idMethod = jest.fn().mockReturnValue(participant);

      const trip = {
        ...mockTrip,
        participants: { id: idMethod },
        save: jest.fn().mockResolvedValue({}),
      };
      mockModel.findById.mockResolvedValueOnce(trip);
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await service.recordPayment('trip-1', participantId.toHexString(), {
        amount: 2000,
        date: '2026-06-01',
        notes: 'Primera cuota',
      });

      expect(participant.payments).toHaveLength(1);
      expect(participant.payments[0].amount).toBe(2000);
    });

    it('should throw NotFoundException for unknown participant', async () => {
      const trip = {
        ...mockTrip,
        participants: { id: jest.fn().mockReturnValue(null) },
      };
      mockModel.findById.mockResolvedValueOnce(trip);

      await expect(
        service.recordPayment('trip-1', 'bad-pid', { amount: 100, date: '2026-06-01' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('draftTransportAssignment()', () => {
    it('should throw when no transports defined', async () => {
      const trip = {
        ...mockTrip,
        participants: [],
        transports: [],
      };
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await expect(service.draftTransportAssignment('trip-1')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should keep M8 and M9 together in one transport', async () => {
      const m8 = makeParticipant({ player: { category: CategoryEnum.M8 } });
      const m9 = makeParticipant({ player: { category: CategoryEnum.M9 } });
      const transport = makeTransport({ capacity: 40 });

      const trip = {
        ...mockTrip,
        participants: [m8, m9],
        transports: [transport],
        save: jest.fn().mockResolvedValue({}),
      };
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await service.draftTransportAssignment('trip-1');

      const tid = transport._id.toString();
      expect(m8.transportId?.toString()).toBe(tid);
      expect(m9.transportId?.toString()).toBe(tid);
    });

    it('should NOT put M7 and M12 in the same transport (gap > MAX)', async () => {
      const m7 = makeParticipant({ player: { category: CategoryEnum.M7 } });
      const m12 = makeParticipant({ player: { category: CategoryEnum.M12 } });
      const t1 = makeTransport({ capacity: 20 });
      const t2 = makeTransport({ capacity: 20 });

      const trip = {
        ...mockTrip,
        participants: [m7, m12],
        transports: [t1, t2],
        save: jest.fn().mockResolvedValue({}),
      };
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });
      mockModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(trip),
      });

      await service.draftTransportAssignment('trip-1');

      // M7 y M12 deben estar en transportes distintos
      expect(m7.transportId?.toString()).not.toBe(m12.transportId?.toString());
    });
  });
});
