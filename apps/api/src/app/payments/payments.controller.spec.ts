import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaymentEntityTypeEnum, PaymentLinkStatusEnum, PaymentMethodEnum, PaymentStatusEnum, PaymentTypeEnum } from '@ltrc-campo/shared-api-model';

const mockLink = {
  id: 'link1',
  linkToken: 'tok',
  entityType: PaymentEntityTypeEnum.MATCH,
  entityId: 'match1',
  concept: 'Tercer tiempo',
  amount: 1000,
  mpFeeRate: 0.0483,
  mpFeeAmount: 48.3,
  netAmount: 951.7,
  paymentType: PaymentTypeEnum.FULL,
  expiresAt: new Date(),
  status: PaymentLinkStatusEnum.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPayment = {
  id: 'pay1',
  entityType: PaymentEntityTypeEnum.MATCH,
  entityId: 'match1',
  playerId: 'player1',
  amount: 1000,
  method: PaymentMethodEnum.MERCADOPAGO,
  status: PaymentStatusEnum.APPROVED,
  concept: 'Tercer tiempo',
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = { _id: 'user1', roles: ['admin'] };

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createLink: jest.fn().mockResolvedValue(mockLink),
            getLinksForEntity: jest.fn().mockResolvedValue([mockLink]),
            cancelLink: jest.fn().mockResolvedValue(mockLink),
            getConfig: jest.fn().mockReturnValue({ mpFeeRate: 0.0483 }),
            getFieldOptions: jest.fn().mockResolvedValue({ concepts: [] }),
            calculateFee: jest.fn().mockReturnValue({ mpFeeRate: 0.0483, grossAmount: 1000, mpFeeAmount: 48.3, netAmount: 951.7 }),
            getPaymentsForEntity: jest.fn().mockResolvedValue([mockPayment]),
            recordManualPayment: jest.fn().mockResolvedValue(mockPayment),
            deleteManualPayment: jest.fn().mockResolvedValue(undefined),
            findPlayerByDni: jest.fn().mockResolvedValue({ playerId: 'p1', playerName: 'Test' }),
            generatePdfReport: jest.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get(PaymentsController);
    service = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createLink calls service with dto and user', async () => {
    const dto: any = { entityId: 'match1', concept: 'Test', amount: 500, paymentType: 'total', expiresAt: new Date().toISOString(), entityType: PaymentEntityTypeEnum.MATCH };
    const req: any = { user: mockUser };
    await controller.createLink(dto, req);
    expect(service.createLink).toHaveBeenCalledWith(dto, mockUser);
  });

  it('getLinks delegates to service', async () => {
    const result = await controller.getLinks(PaymentEntityTypeEnum.MATCH, 'match1');
    expect(service.getLinksForEntity).toHaveBeenCalledWith(PaymentEntityTypeEnum.MATCH, 'match1');
    expect(result).toEqual([mockLink]);
  });

  it('cancelLink delegates to service', async () => {
    await controller.cancelLink('link1');
    expect(service.cancelLink).toHaveBeenCalledWith('link1');
  });

  it('getConfig returns fee rate', () => {
    const result = controller.getConfig();
    expect(result).toEqual({ mpFeeRate: 0.0483 });
  });

  it('getFeePreview delegates with parsed amount', () => {
    controller.getFeePreview('500');
    expect(service.calculateFee).toHaveBeenCalledWith(500);
  });

  it('getPayments delegates to service', async () => {
    const result = await controller.getPayments(PaymentEntityTypeEnum.MATCH, 'match1');
    expect(service.getPaymentsForEntity).toHaveBeenCalledWith(PaymentEntityTypeEnum.MATCH, 'match1');
    expect(result).toEqual([mockPayment]);
  });

  it('recordManual calls service with dto and user', async () => {
    const dto: any = { entityId: 'match1', playerId: 'p1', amount: 100, method: 'cash', concept: 'Test', date: new Date().toISOString(), entityType: PaymentEntityTypeEnum.MATCH };
    const req: any = { user: mockUser };
    await controller.recordManual(dto, req);
    expect(service.recordManualPayment).toHaveBeenCalledWith(dto, mockUser);
  });

  it('deleteManual delegates to service', async () => {
    await controller.deleteManual('pay1');
    expect(service.deleteManualPayment).toHaveBeenCalledWith('pay1');
  });

  it('findPlayerByDni delegates to service', async () => {
    const result = await controller.findPlayerByDni('12345678');
    expect(service.findPlayerByDni).toHaveBeenCalledWith('12345678');
    expect(result.playerName).toBe('Test');
  });
});
