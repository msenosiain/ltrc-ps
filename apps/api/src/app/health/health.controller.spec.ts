import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { getConnectionToken } from '@nestjs/mongoose';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockConnection = {
    readyState: 1,
    db: {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({ ok: 1 }),
      }),
    },
  };

  const mockHealthCheckService = {
    check: jest.fn((indicators) =>
      Promise.all(indicators.map((fn) => fn())).then((details) => ({
        status: 'ok',
        details: Object.assign({}, ...details),
      }))
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return successfully when healthy', async () => {
      await expect(controller.check()).resolves.toBeUndefined();
    });

    it('should throw ServiceUnavailableException when unhealthy', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockRejectedValueOnce(new Error('unhealthy'));

      await expect(controller.check()).rejects.toThrow(
        ServiceUnavailableException
      );
    });
  });

  describe('checkMongo', () => {
    let mockRes: any;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return 200 when MongoDB is connected', async () => {
      await controller.checkMongo(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ok' })
      );
    });

    it('should return 503 when MongoDB is disconnected', async () => {
      const disconnectedConnection = {
        readyState: 0,
        db: { admin: () => ({ ping: jest.fn() }) },
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [HealthController],
        providers: [
          { provide: HealthCheckService, useValue: mockHealthCheckService },
          {
            provide: getConnectionToken(),
            useValue: disconnectedConnection,
          },
        ],
      }).compile();

      const ctrl = module.get<HealthController>(HealthController);
      await ctrl.checkMongo(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
    });
  });
});
