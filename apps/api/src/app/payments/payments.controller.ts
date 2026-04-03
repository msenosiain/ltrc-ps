import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum, PaymentEntityTypeEnum } from '@ltrc-campo/shared-api-model';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { RecordManualPaymentDto } from './dto/record-manual-payment.dto';

const ALL = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH];
const LINK_CREATE = [RoleEnum.ADMIN, RoleEnum.COORDINATOR];
const MANUAL_PAYMENT = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR];

const Protected = (...roles: RoleEnum[]) =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('links')
  @Protected(...LINK_CREATE)
  createLink(@Body() dto: CreatePaymentLinkDto, @Req() req: Request) {
    return this.paymentsService.createLink(dto, (req as any).user);
  }

  @Get('links')
  @Protected(...ALL)
  getLinks(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getLinksForEntity(entityType, entityId);
  }

  @Delete('links/:id')
  @Protected(...ALL)
  cancelLink(@Param('id') id: string) {
    return this.paymentsService.cancelLink(id);
  }

  @Get('config')
  @Protected(...ALL)
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @Get('field-options')
  @Protected(...ALL)
  getFieldOptions() {
    return this.paymentsService.getFieldOptions();
  }

  @Get('fee-preview')
  @Protected(...ALL)
  getFeePreview(@Query('amount') amount: string) {
    return this.paymentsService.calculateFee(Number(amount));
  }

  @Get('report/pdf')
  @Protected(...ALL)
  async downloadPdf(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string,
    @Res() res: Response
  ) {
    const buffer = await this.paymentsService.generatePdfReport(entityType, entityId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cobros-${entityType}-${entityId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('internal/players/by-dni/:dni')
  @Protected(...ALL)
  findPlayerByDni(@Param('dni') dni: string) {
    return this.paymentsService.findPlayerByDni(dni);
  }

  @Get()
  @Protected(...ALL)
  getPayments(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getPaymentsForEntity(entityType, entityId);
  }

  @Post()
  @Protected(...MANUAL_PAYMENT)
  recordManual(@Body() dto: RecordManualPaymentDto, @Req() req: Request) {
    return this.paymentsService.recordManualPayment(dto, (req as any).user);
  }

  @Delete(':id')
  @Protected(...ALL)
  deleteManual(@Param('id') id: string) {
    return this.paymentsService.deleteManualPayment(id);
  }
}
