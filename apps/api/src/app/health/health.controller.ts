import {
  Controller,
  Get,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Response } from 'express';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @InjectConnection() private readonly mongoConnection: Connection
  ) {}

  /**
   * Basic liveness check. Returns 200 when the service is alive.
   */
  @Get()
  @HealthCheck()
  async check(): Promise<void> {
    try {
      await this.health.check([
        () => Promise.resolve({ api: { status: 'up' } }),
      ]);
    } catch (error) {
      throw new ServiceUnavailableException();
    }
  }

  /**
   * MongoDB connectivity check. Returns connection state and details.
   */
  @Get('mongo')
  @HealthCheck()
  async checkMongo(@Res() res: Response): Promise<void> {
    try {
      const result = await this.health.check([
        async () => {
          const state = this.mongoConnection.readyState;
          if (state !== 1) {
            throw new Error(`MongoDB not connected (state: ${state})`);
          }
          await this.mongoConnection.db.admin().ping();
          return { mongodb: { status: 'up' } };
        },
      ]);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        res.status(503).json(error.getResponse());
        return;
      }

      res.status(503).json({
        status: 'error',
        details: {
          mongodb: {
            status: 'down',
            error: (error as Error).message || 'Unknown error',
          },
        },
      });
    }
  }
}
