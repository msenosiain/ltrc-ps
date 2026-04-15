import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ValidateDniDto } from './dto/validate-dni.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments/public')
export class PaymentsPublicController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('links/:token')
  getPublicLinkInfo(@Param('token') token: string) {
    return this.paymentsService.getPublicLinkInfo(token);
  }

  @Post('links/:token/validate')
  validateDni(@Param('token') token: string, @Body() dto: ValidateDniDto) {
    return this.paymentsService.validateDni(token, dto.dni);
  }

  @Post('links/:token/checkout')
  initiateCheckout(@Param('token') token: string, @Body() dto: ValidateDniDto) {
    return this.paymentsService.initiateCheckout(token, dto.dni);
  }

  @Post('confirm')
  confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }

  // IPN de MercadoPago — MP llama este endpoint cuando cambia el estado de un pago
  @Post('webhook/mp')
  async handleMpWebhook(@Body() body: any) {
    if (body?.type === 'payment' && body?.data?.id) {
      await this.paymentsService.syncPaymentByMpId(String(body.data.id));
    }
    return { received: true };
  }
}
