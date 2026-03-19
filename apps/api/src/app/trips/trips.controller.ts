import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripFilterDto } from './dto/trip-filter.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { AddTransportDto } from './dto/add-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { MoveParticipantDto } from './dto/move-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../shared/pagination.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findAll(@Query() query: PaginationDto<TripFilterDto>, @Req() req: Request) {
    return this.tripsService.findPaginated(query, (req as any).user);
  }

  @Post()
  create(@Body() dto: CreateTripDto, @Req() req: Request) {
    return this.tripsService.create(dto, (req as any).user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTripDto, @Req() req: Request) {
    return this.tripsService.update(id, dto, (req as any).user);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tripsService.delete(id);
  }

  // ── Participantes ──────────────────────────────────────────────────────────

  @Post(':id/participants')
  addParticipant(
    @Param('id') id: string,
    @Body() dto: AddParticipantDto,
    @Req() req: Request
  ) {
    return this.tripsService.addParticipant(id, dto, (req as any).user);
  }

  @Patch(':id/participants/:participantId')
  updateParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() dto: UpdateParticipantDto,
    @Req() req: Request
  ) {
    return this.tripsService.updateParticipant(id, participantId, dto, (req as any).user);
  }

  @Delete(':id/participants/:participantId')
  removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Req() req: Request
  ) {
    return this.tripsService.removeParticipant(id, participantId, (req as any).user);
  }

  // ── Pagos ──────────────────────────────────────────────────────────────────

  @Post(':id/participants/:participantId/payments')
  recordPayment(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: Request
  ) {
    return this.tripsService.recordPayment(id, participantId, dto, (req as any).user);
  }

  @Delete(':id/participants/:participantId/payments/:paymentId')
  removePayment(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Param('paymentId') paymentId: string,
    @Req() req: Request
  ) {
    return this.tripsService.removePayment(id, participantId, paymentId, (req as any).user);
  }

  // ── Transportes ───────────────────────────────────────────────────────────

  @Post(':id/transports')
  addTransport(
    @Param('id') id: string,
    @Body() dto: AddTransportDto,
    @Req() req: Request
  ) {
    return this.tripsService.addTransport(id, dto, (req as any).user);
  }

  @Patch(':id/transports/:transportId')
  updateTransport(
    @Param('id') id: string,
    @Param('transportId') transportId: string,
    @Body() dto: UpdateTransportDto,
    @Req() req: Request
  ) {
    return this.tripsService.updateTransport(id, transportId, dto, (req as any).user);
  }

  @Delete(':id/transports/:transportId')
  removeTransport(
    @Param('id') id: string,
    @Param('transportId') transportId: string,
    @Req() req: Request
  ) {
    return this.tripsService.removeTransport(id, transportId, (req as any).user);
  }

  @Post(':id/transports/draft')
  draftTransportAssignment(@Param('id') id: string, @Req() req: Request) {
    return this.tripsService.draftTransportAssignment(id, (req as any).user);
  }

  @Patch(':id/participants/:participantId/transport')
  moveParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() dto: MoveParticipantDto,
    @Req() req: Request
  ) {
    return this.tripsService.moveParticipant(id, participantId, dto, (req as any).user);
  }
}
