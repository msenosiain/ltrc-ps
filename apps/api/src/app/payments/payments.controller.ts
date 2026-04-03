import {
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
import { ValidateDniDto } from './dto/validate-dni.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

const PAYMENT_ROLES = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH];
const LINK_CREATE_ROLES = [RoleEnum.ADMIN, RoleEnum.COORDINATOR];
const MANUAL_PAYMENT_ROLES = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR];

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ── Endpoints protegidos ──────────────────────────────────────────────────

  @Post('links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...LINK_CREATE_ROLES)
  createLink(@Body() dto: CreatePaymentLinkDto, @Req() req: Request) {
    return this.paymentsService.createLink(dto, (req as any).user);
  }

  @Get('links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  getLinks(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getLinksForEntity(entityType, entityId);
  }

  @Delete('links/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  cancelLink(@Param('id') id: string) {
    return this.paymentsService.cancelLink(id);
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @Get('field-options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  getFieldOptions() {
    return this.paymentsService.getFieldOptions();
  }

  @Get('fee-preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  getFeePreview(@Query('amount') amount: string) {
    return this.paymentsService.calculateFee(Number(amount));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  getPayments(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getPaymentsForEntity(entityType, entityId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...MANUAL_PAYMENT_ROLES)
  recordManual(@Body() dto: RecordManualPaymentDto, @Req() req: Request) {
    return this.paymentsService.recordManualPayment(dto, (req as any).user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  deleteManual(@Param('id') id: string) {
    return this.paymentsService.deleteManualPayment(id);
  }

  @Get('report/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
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

  // ── Endpoints públicos ────────────────────────────────────────────────────

  @Get('public/links/:token')
  getPublicLinkInfo(@Param('token') token: string) {
    return this.paymentsService.getPublicLinkInfo(token);
  }

  @Post('public/links/:token/validate')
  validateDni(@Param('token') token: string, @Body() dto: ValidateDniDto) {
    return this.paymentsService.validateDni(token, dto.dni);
  }

  @Post('public/links/:token/checkout')
  initiateCheckout(@Param('token') token: string, @Body() dto: ValidateDniDto) {
    return this.paymentsService.initiateCheckout(token, dto.dni);
  }

  @Post('public/confirm')
  confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  @Get('internal/players/by-dni/:dni')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PAYMENT_ROLES)
  findPlayerByDni(@Param('dni') dni: string) {
    return this.paymentsService.findPlayerByDni(dni);
  }
}
