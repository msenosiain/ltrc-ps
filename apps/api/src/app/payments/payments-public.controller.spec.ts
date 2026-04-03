import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsPublicController } from './payments-public.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntityTypeEnum, PaymentLinkStatusEnum, PaymentStatusEnum, PaymentTypeEnum } from '@ltrc-campo/shared-api-model';

const mockPublicInfo = {
  linkToken: 'tok',
  concept: 'Tercer tiempo',
  amount: 1000,
  mpFeeRate: 0.0483,
  mpFeeAmount: 48.3,
  netAmount: 951.7,
  paymentType: PaymentTypeEnum.FULL,
  expiresAt: new Date(),
  entityType: PaymentEntityTypeEnum.MATCH,
  entityLabel: 'vs Rival (1/1/2026)',
};

describe('PaymentsPublicController', () => {
  let controller: PaymentsPublicController;
  let service: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsPublicController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            getPublicLinkInfo: jest.fn().mockResolvedValue(mockPublicInfo),
            validateDni: jest.fn().mockResolvedValue({ playerId: 'p1', playerName: 'Test Player' }),
            initiateCheckout: jest.fn().mockResolvedValue({ checkoutUrl: 'https://mp.com/checkout' }),
            confirmPayment: jest.fn().mockResolvedValue({ status: PaymentStatusEnum.APPROVED }),
          },
        },
      ],
    }).compile();

    controller = module.get(PaymentsPublicController);
    service = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getPublicLinkInfo returns link info', async () => {
    const result = await controller.getPublicLinkInfo('tok');
    expect(service.getPublicLinkInfo).toHaveBeenCalledWith('tok');
    expect(result).toEqual(mockPublicInfo);
  });

  it('validateDni returns player name', async () => {
    const result = await controller.validateDni('tok', { dni: '12345678' });
    expect(service.validateDni).toHaveBeenCalledWith('tok', '12345678');
    expect(result.playerName).toBe('Test Player');
  });

  it('initiateCheckout returns checkoutUrl', async () => {
    const result = await controller.initiateCheckout('tok', { dni: '12345678' });
    expect(service.initiateCheckout).toHaveBeenCalledWith('tok', '12345678');
    expect(result.checkoutUrl).toBe('https://mp.com/checkout');
  });

  it('confirmPayment delegates to service', async () => {
    const dto = { externalReference: 'ref123' };
    await controller.confirmPayment(dto);
    expect(service.confirmPayment).toHaveBeenCalledWith(dto);
  });
});
