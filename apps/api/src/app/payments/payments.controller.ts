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
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentEntityTypeEnum, RoleEnum } from '@ltrc-campo/shared-api-model';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { RecordManualPaymentDto } from './dto/record-manual-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR, RoleEnum.COACH)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('links')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR)
  createLink(@Body() dto: CreatePaymentLinkDto, @Req() req: Request) {
    return this.paymentsService.createLink(dto, (req as any).user);
  }

  @Get('links')
  getLinks(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getLinksForEntity(entityType, entityId);
  }

  @Delete('links/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR)
  cancelLink(@Param('id') id: string) {
    return this.paymentsService.cancelLink(id);
  }

  @Get('config')
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @Get('field-options')
  getFieldOptions() {
    return this.paymentsService.getFieldOptions();
  }

  @Get('fee-preview')
  getFeePreview(@Query('amount') amount: string) {
    return this.paymentsService.calculateFee(Number(amount));
  }

  @Get('stats')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER)
  getPaymentStats(@Query('sport') sport?: string) {
    return this.paymentsService.getStats(sport);
  }

  @Get('report/encounter')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR)
  getEncounterReport(@Query('matchIds') matchIds: string) {
    const ids = matchIds?.split(',').filter(Boolean) ?? [];
    return this.paymentsService.getEncounterReport(ids);
  }

  @Get('report/encounter/pdf')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR)
  async downloadEncounterPdf(
    @Query('matchIds') matchIds: string,
    @Res() res: Response
  ) {
    const ids = matchIds?.split(',').filter(Boolean) ?? [];
    const buffer = await this.paymentsService.generateEncounterPdfReport(ids);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="informe-encuentro.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('report/pdf')
  async downloadPdf(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string,
    @Res() res: Response
  ) {
    const buffer = await this.paymentsService.generatePdfReport(
      entityType,
      entityId
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cobros-${entityType}-${entityId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('internal/players/by-dni/:dni')
  findPlayerByDni(@Param('dni') dni: string) {
    return this.paymentsService.findPlayerByDni(dni);
  }

  @Get()
  getPayments(
    @Query('entityType') entityType: PaymentEntityTypeEnum,
    @Query('entityId') entityId: string
  ) {
    return this.paymentsService.getPaymentsForEntity(entityType, entityId);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR)
  recordManual(@Body() dto: RecordManualPaymentDto, @Req() req: Request) {
    return this.paymentsService.recordManualPayment(dto, (req as any).user);
  }

  @Post(':id/sync')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH)
  syncPayment(@Param('id') id: string) {
    return this.paymentsService.syncPaymentById(id);
  }

  @Delete(':id')
  deleteManual(@Param('id') id: string) {
    return this.paymentsService.deleteManualPayment(id);
  }
}
