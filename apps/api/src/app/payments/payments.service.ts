import {
  BadRequestException,
  GoneException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import MercadoPagoConfig, { Payment as MpPayment, Preference } from 'mercadopago';
import { PaymentLinkEntity } from './schemas/payment-link.entity';
import { PaymentEntity } from './schemas/payment.entity';
import { PlayerEntity } from '../players/schemas/player.entity';
import { MatchEntity } from '../matches/schemas/match.entity';
import { TripEntity } from '../trips/schemas/trip.entity';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { RecordManualPaymentDto } from './dto/record-manual-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { User } from '../users/schemas/user.schema';
import {
  CategoryEnum,
  PaymentEntityTypeEnum,
  PaymentLinkStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  getCategoryLabel,
} from '@ltrc-campo/shared-api-model';

@Injectable()
export class PaymentsService {
  private readonly mpClient: MercadoPagoConfig;
  private readonly appBaseUrl: string;
  private readonly mpFeeRate: number;

  constructor(
    @InjectModel(PaymentLinkEntity.name)
    private readonly paymentLinkModel: Model<PaymentLinkEntity>,
    @InjectModel(PaymentEntity.name)
    private readonly paymentModel: Model<PaymentEntity>,
    @InjectModel(PlayerEntity.name)
    private readonly playerModel: Model<PlayerEntity>,
    @InjectModel(MatchEntity.name)
    private readonly matchModel: Model<MatchEntity>,
    @InjectModel(TripEntity.name)
    private readonly tripModel: Model<TripEntity>,
    private readonly configService: ConfigService
  ) {
    // MP_FEE_RATE se configura como porcentaje (ej: 5 = 5%, 4.83 = 4.83%)
    const feePercent = this.configService.get<number>('MP_FEE_RATE', 4.83);
    this.mpFeeRate = feePercent / 100;
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN', ''),
    });
    this.appBaseUrl = this.configService.get<string>(
      'APP_BASE_URL',
      'http://localhost:4200'
    );
  }

  // ── Cálculo de comisión ────────────────────────────────────────────────────

  calculateFee(netTarget: number) {
    // El manager ingresa lo que quiere recibir neto; calculamos el bruto que paga el jugador
    const rawGross = netTarget / (1 - this.mpFeeRate);
    const grossAmount = Math.ceil(rawGross / 10) * 10;
    const mpFeeAmount = Math.round(grossAmount * this.mpFeeRate * 100) / 100;
    const netAmount = Math.round((grossAmount - mpFeeAmount) * 100) / 100;
    return { mpFeeRate: this.mpFeeRate, grossAmount, mpFeeAmount, netAmount };
  }

  getConfig() {
    return { mpFeeRate: this.mpFeeRate };
  }

  async getFieldOptions() {
    const concepts = await this.paymentLinkModel.distinct('concept');
    return { concepts: concepts.sort() };
  }

  // ── PaymentLinks ──────────────────────────────────────────────────────────

  async createLink(dto: CreatePaymentLinkDto, caller: User) {
    if (!dto.entityId && (!dto.entityIds?.length)) {
      throw new BadRequestException('Se requiere entityId o entityIds');
    }
    const entityId = dto.entityId
      ? new Types.ObjectId(dto.entityId)
      : new Types.ObjectId(dto.entityIds![0]);
    const entityIds = dto.entityIds?.length
      ? dto.entityIds.map((id) => new Types.ObjectId(id))
      : undefined;

    const { mpFeeRate, grossAmount, mpFeeAmount, netAmount } = this.calculateFee(dto.amount);

    return this.paymentLinkModel.create({
      linkToken: uuidv4(),
      entityType: dto.entityType,
      entityId,
      entityIds,
      concept: dto.concept,
      description: dto.description,
      amount: grossAmount,
      mpFeeRate,
      mpFeeAmount,
      netAmount,
      paymentType: dto.paymentType,
      installmentNumber: dto.installmentNumber,
      installmentTotal: dto.installmentTotal,
      expiresAt: new Date(dto.expiresAt),
      status: PaymentLinkStatusEnum.ACTIVE,
      createdBy: (caller as any)._id,
    });
  }

  async getLinksForEntity(entityType: PaymentEntityTypeEnum, entityId: string) {
    const oid = new Types.ObjectId(entityId);
    return this.paymentLinkModel
      .find({ entityType, $or: [{ entityId: oid }, { entityIds: oid }] })
      .sort({ createdAt: -1 });
  }

  async cancelLink(id: string) {
    const link = await this.paymentLinkModel.findById(id);
    if (!link) throw new NotFoundException('Link de pago no encontrado');
    link.status = PaymentLinkStatusEnum.CANCELLED;
    return link.save();
  }

  // ── Endpoints públicos ────────────────────────────────────────────────────

  async getPublicLinkInfo(token: string) {
    const link = await this.paymentLinkModel.findOne({ linkToken: token }).lean();
    if (!link) throw new NotFoundException('Link de pago no encontrado');
    this.assertLinkActive(link);

    const [entityLabel, matchInfo] = await Promise.all([
      this.resolveEntityLabel(link.entityType, link.entityId.toString(), link.entityIds),
      this.resolveMatchInfo(link.entityType, link.entityId.toString(), link.entityIds),
    ]);

    return {
      linkToken: link.linkToken,
      concept: link.concept,
      description: link.description,
      amount: link.amount,
      mpFeeRate: link.mpFeeRate,
      mpFeeAmount: link.mpFeeAmount,
      netAmount: link.netAmount,
      paymentType: link.paymentType,
      installmentNumber: link.installmentNumber,
      installmentTotal: link.installmentTotal,
      expiresAt: link.expiresAt,
      entityType: link.entityType,
      entityLabel,
      matchDate: matchInfo?.date,
      matchOpponents: matchInfo?.opponents,
      matchCategories: matchInfo?.categories,
    };
  }

  async validateDni(token: string, dni: string) {
    const link = await this.paymentLinkModel.findOne({ linkToken: token });
    if (!link) throw new NotFoundException('Link de pago no encontrado');
    this.assertLinkActive(link);

    const player = await this.playerModel
      .findOne({ idNumber: dni })
      .select('id name idNumber email category')
      .lean();
    if (!player) throw new NotFoundException('No se encontró un jugador con ese DNI');

    if (link.entityIds?.length) {
      const matches = await this.matchModel
        .find({ _id: { $in: link.entityIds } })
        .select('category')
        .lean();
      const matchForPlayer = matches.find((m) => m.category === player.category);
      if (!matchForPlayer) {
        throw new HttpException(
          { code: 'CATEGORY_NOT_IN_GROUP', playerCategory: player.category },
          400
        );
      }
    } else if (link.entityType === PaymentEntityTypeEnum.MATCH && player.category) {
      const match = await this.matchModel
        .findById(link.entityId)
        .select('category')
        .lean();
      if (match?.category && match.category !== player.category) {
        throw new HttpException(
          { code: 'CATEGORY_MISMATCH', playerCategory: player.category, matchCategory: match.category },
          400
        );
      }
    }

    return { playerId: player._id.toString(), playerName: player.name };
  }

  async initiateCheckout(token: string, dni: string) {
    const link = await this.paymentLinkModel.findOne({ linkToken: token });
    if (!link) throw new NotFoundException('Link de pago no encontrado');
    this.assertLinkActive(link);

    const player = await this.playerModel
      .findOne({ idNumber: dni })
      .select('id name idNumber email category')
      .lean();
    if (!player) throw new NotFoundException('No se encontró un jugador con ese DNI');

    // Para links de jornada: resolver el partido correcto según categoría del jugador
    let targetEntityId: Types.ObjectId = link.entityId;
    if (link.entityIds?.length) {
      const matches = await this.matchModel
        .find({ _id: { $in: link.entityIds } })
        .select('category')
        .lean();
      const matchForPlayer = matches.find((m) => m.category === player.category);
      if (!matchForPlayer) {
        throw new HttpException(
          { code: 'CATEGORY_NOT_IN_GROUP', playerCategory: player.category },
          400
        );
      }
      targetEntityId = (matchForPlayer as any)._id;
    } else if (link.entityType === PaymentEntityTypeEnum.MATCH && player.category) {
      const match = await this.matchModel
        .findById(link.entityId)
        .select('category')
        .lean();
      if (match?.category && match.category !== player.category) {
        throw new HttpException(
          { code: 'CATEGORY_MISMATCH', playerCategory: player.category, matchCategory: match.category },
          400
        );
      }
    }

    const externalReference = uuidv4();

    // Crea registro de pago pendiente
    const payment = await this.paymentModel.create({
      paymentLinkId: link._id,
      entityType: link.entityType,
      entityId: targetEntityId,
      playerId: player._id,
      amount: link.amount,
      method: PaymentMethodEnum.MERCADOPAGO,
      status: PaymentStatusEnum.PENDING,
      concept: link.concept,
      mpExternalReference: externalReference,
      date: new Date(),
    });

    const entityLabel = await this.resolveEntityLabel(
      link.entityType,
      link.entityId.toString()
    );

    // Crea preferencia en MP
    const preference = new Preference(this.mpClient);
    const mpResponse = await preference.create({
      body: {
        items: [
          {
            id: payment.id,
            title: `${link.concept} - ${entityLabel}`,
            description: link.description ?? link.concept,
            quantity: 1,
            unit_price: link.amount,
            currency_id: 'ARS',
          },
        ],
        payer: {
          name: player.name,
          identification: { type: 'DNI', number: player.idNumber },
        },
        external_reference: externalReference,
        back_urls: {
          success: `${this.appBaseUrl}/pay/result`,
          failure: `${this.appBaseUrl}/pay/result`,
          pending: `${this.appBaseUrl}/pay/result`,
        },
        ...(this.appBaseUrl.startsWith('https://') ? { auto_return: 'approved' as const } : {}),
        expiration_date_to: link.expiresAt.toISOString(),
      },
    });

    // Guarda el preference ID en el pago
    await this.paymentModel.findByIdAndUpdate(payment.id, {
      mpPreferenceId: mpResponse.id,
    });

    const checkoutUrl = this.appBaseUrl.startsWith('https://')
      ? mpResponse.init_point
      : (mpResponse.sandbox_init_point ?? mpResponse.init_point);
    return { checkoutUrl };
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const payment = await this.paymentModel.findOne({
      mpExternalReference: dto.externalReference,
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    // Si MP no envió payment_id (ej: pago pendiente o error de red), guardamos el status del redirect
    if (!dto.paymentId) {
      payment.status = this.mapMpStatus(dto.status ?? 'pending');
      await payment.save();
      return { status: payment.status };
    }

    // Verificamos contra la API de MP para no confiar solo en los query params del redirect
    try {
      const mpPayment = new MpPayment(this.mpClient);
      const mpData = await mpPayment.get({ id: dto.paymentId });

      payment.mpPaymentId = String(mpData.id);
      payment.mpStatusDetail = mpData.status_detail ?? undefined;
      payment.status = this.mapMpStatus(mpData.status ?? 'pending');
      payment.date = mpData.date_approved
        ? new Date(mpData.date_approved)
        : new Date();
      await payment.save();
    } catch {
      // Si falla la verificación con MP, guardamos lo que vino del redirect
      payment.status = this.mapMpStatus(dto.status ?? 'pending');
      await payment.save();
    }

    return { status: payment.status };
  }

  // ── Pagos manuales ────────────────────────────────────────────────────────

  async recordManualPayment(dto: RecordManualPaymentDto, caller: User) {
    const player = await this.playerModel.findById(dto.playerId).select('id').lean();
    if (!player) throw new NotFoundException('Jugador no encontrado');

    return this.paymentModel.create({
      entityType: dto.entityType,
      entityId: new Types.ObjectId(dto.entityId),
      playerId: new Types.ObjectId(dto.playerId),
      amount: dto.amount,
      method: dto.method,
      status: PaymentStatusEnum.APPROVED,
      concept: dto.concept,
      date: new Date(dto.date),
      notes: dto.notes,
      recordedBy: (caller as any)._id,
    });
  }

  async getPaymentsForEntity(entityType: PaymentEntityTypeEnum, entityId: string) {
    return this.paymentModel
      .find({ entityType, entityId: new Types.ObjectId(entityId) })
      .populate({ path: 'playerId', select: 'name idNumber' })
      .sort({ date: -1 });
  }

  async findPlayerByDni(dni: string) {
    const player = await this.playerModel
      .findOne({ idNumber: dni })
      .select('id name idNumber')
      .lean();
    if (!player) throw new NotFoundException('No se encontró un jugador con ese DNI');
    return { playerId: player._id.toString(), playerName: player.name };
  }

  async deleteManualPayment(id: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.method === PaymentMethodEnum.MERCADOPAGO) {
      throw new BadRequestException('No se pueden eliminar pagos de Mercado Pago');
    }
    await payment.deleteOne();
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getStats(sport?: string): Promise<{
    byMethod: { mp: number; cash: number };
    mpAdoptionPct: number;
    activePendingLinks: number;
    recentEvents: {
      linkId: string;
      concept: string;
      entityType: string;
      label: string;
      approved: number;
      pending: number;
      createdAt: Date;
    }[];
  }> {
    // Build entity scope filter when sport is specified
    let linkScopeFilter: Record<string, unknown> = {};
    if (sport) {
      const [matchIds, tripIds] = await Promise.all([
        this.matchModel.find({ sport }).distinct('_id'),
        this.tripModel.find({ sport }).distinct('_id'),
      ]);
      linkScopeFilter = {
        $or: [
          { entityType: PaymentEntityTypeEnum.MATCH, entityId: { $in: matchIds } },
          { entityType: PaymentEntityTypeEnum.TRIP, entityId: { $in: tripIds } },
        ],
      };
    }

    const [scopedLinkIds, recentLinks, pendingLinksCount] = await Promise.all([
      sport
        ? this.paymentLinkModel.find(linkScopeFilter).distinct('_id')
        : this.paymentLinkModel.find().distinct('_id'),
      this.paymentLinkModel
        .find(linkScopeFilter)
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      this.paymentLinkModel.countDocuments({ ...linkScopeFilter, status: PaymentLinkStatusEnum.ACTIVE }),
    ]);

    const paymentScopeFilter = sport ? { paymentLinkId: { $in: scopedLinkIds } } : {};

    const byMethodRaw = await this.paymentModel.aggregate([
      { $match: { ...paymentScopeFilter, status: PaymentStatusEnum.APPROVED } },
      { $group: { _id: '$method', count: { $sum: 1 } } },
    ]);

    const mpCount: number = byMethodRaw.find((r) => r._id === PaymentMethodEnum.MERCADOPAGO)?.count ?? 0;
    const cashCount: number = byMethodRaw.find((r) => r._id === PaymentMethodEnum.CASH)?.count ?? 0;
    const total = mpCount + cashCount;
    const mpAdoptionPct = total > 0 ? Math.round((mpCount / total) * 100) : 0;

    // For each recent link, count approved and pending payments
    const linkIds = recentLinks.map((l) => l._id);
    const paymentCounts = await this.paymentModel.aggregate([
      { $match: { paymentLinkId: { $in: linkIds }, status: { $in: [PaymentStatusEnum.APPROVED, PaymentStatusEnum.PENDING] } } },
      { $group: { _id: { linkId: '$paymentLinkId', status: '$status' }, count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, { approved: number; pending: number }> = {};
    for (const r of paymentCounts) {
      const key = r._id.linkId.toString();
      if (!countMap[key]) countMap[key] = { approved: 0, pending: 0 };
      if (r._id.status === PaymentStatusEnum.APPROVED) countMap[key].approved = r.count;
      if (r._id.status === PaymentStatusEnum.PENDING) countMap[key].pending = r.count;
    }

    const recentEvents = await Promise.all(
      recentLinks.map(async (link) => {
        const label = await this.resolveEntityLabel(link.entityType, link.entityId.toString(), link.entityIds);
        const counts = countMap[link._id.toString()] ?? { approved: 0, pending: 0 };
        return {
          linkId: link._id.toString(),
          concept: link.concept,
          entityType: link.entityType,
          label,
          approved: counts.approved,
          pending: counts.pending,
          createdAt: link.createdAt,
        };
      })
    );

    return {
      byMethod: { mp: mpCount, cash: cashCount },
      mpAdoptionPct,
      activePendingLinks: pendingLinksCount,
      recentEvents,
    };
  }

  // ── Reporte PDF ───────────────────────────────────────────────────────────

  async generatePdfReport(
    entityType: PaymentEntityTypeEnum,
    entityId: string
  ): Promise<Buffer> {
    const [payments, entityLabel] = await Promise.all([
      this.paymentModel
        .find({ entityType, entityId: new Types.ObjectId(entityId) })
        .populate({ path: 'playerId', select: 'name idNumber' })
        .sort({ date: 1 })
        .lean(),
      this.resolveEntityLabel(entityType, entityId),
    ]);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(16).text('Los Tordos RC — Reporte de Cobros', { align: 'center' });
      doc.fontSize(12).text(entityLabel, { align: 'center' });
      doc.moveDown();

      // Totales
      const approved = payments.filter((p) => p.status === PaymentStatusEnum.APPROVED);
      const totalApproved = approved.reduce((s, p) => s + p.amount, 0);
      const pending = payments.filter((p) => p.status === PaymentStatusEnum.PENDING);
      const totalPending = pending.reduce((s, p) => s + p.amount, 0);

      doc
        .fontSize(10)
        .text(`Total aprobado: $${totalApproved.toFixed(2)}   |   Pendiente: $${totalPending.toFixed(2)}   |   Total pagos: ${payments.length}`)
        .moveDown();

      // Tabla
      const cols = [30, 160, 60, 80, 80, 70, 90, 100];
      const headers = ['#', 'Jugador', 'DNI', 'Concepto', 'Método', 'Monto', 'Fecha', 'Estado'];
      const startX = 40;
      let y = doc.y;

      // Cabecera de tabla
      doc.fontSize(8).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, startX + cols.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: cols[i],
          align: 'left',
        });
      });
      y += 14;
      doc.moveTo(startX, y).lineTo(startX + cols.reduce((a, b) => a + b, 0), y).stroke();
      y += 4;

      // Filas
      doc.font('Helvetica');
      payments.forEach((p, idx) => {
        const player = p.playerId as any;
        const row = [
          String(idx + 1),
          player?.name ?? '-',
          player?.idNumber ?? '-',
          p.concept,
          p.method,
          `$${p.amount.toFixed(2)}`,
          this.formatDate(p.date),
          p.status,
        ];

        if (y > 750) {
          doc.addPage();
          y = 40;
        }

        row.forEach((cell, i) => {
          doc.fontSize(8).text(cell, startX + cols.slice(0, i).reduce((a, b) => a + b, 0), y, {
            width: cols[i],
            align: 'left',
          });
        });
        y += 14;
      });

      doc.end();
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private assertLinkActive(link: { status: PaymentLinkStatusEnum; expiresAt: Date }) {
    if (link.status === PaymentLinkStatusEnum.CANCELLED) {
      throw new GoneException('Este link de pago fue cancelado');
    }
    if (link.status === PaymentLinkStatusEnum.EXPIRED || new Date() > link.expiresAt) {
      throw new GoneException('Este link de pago ha expirado');
    }
  }


  private mapMpStatus(mpStatus: string): PaymentStatusEnum {
    switch (mpStatus) {
      case 'approved':
        return PaymentStatusEnum.APPROVED;
      case 'in_process':
      case 'authorized':
        return PaymentStatusEnum.IN_PROCESS;
      case 'rejected':
        return PaymentStatusEnum.REJECTED;
      case 'cancelled':
        return PaymentStatusEnum.CANCELLED;
      default:
        return PaymentStatusEnum.PENDING;
    }
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
  }

  private readonly CATEGORY_ORDER = [
    'm5','m6','m7','m8','m9','m10','m11','m12','m13','m14','m15','m16','m17','m19',
    'pre_decima','decima','novena','octava','septima','sexta','quinta','cuarta','master','plantel_superior',
  ];

  private async resolveMatchInfo(
    entityType: PaymentEntityTypeEnum,
    entityId: string,
    entityIds?: Types.ObjectId[]
  ): Promise<{ date: string; opponents: string; categories: string[] } | null> {
    if (entityType !== PaymentEntityTypeEnum.MATCH) return null;

    if (entityIds && entityIds.length > 1) {
      const matches = await this.matchModel
        .find({ _id: { $in: entityIds } })
        .select('date opponent category')
        .lean();
      if (!matches.length) return null;
      const date = this.formatDate(matches[0].date);
      const categories = matches
        .map((m) => m.category)
        .filter(Boolean) as string[];
      categories.sort(
        (a, b) => this.CATEGORY_ORDER.indexOf(a) - this.CATEGORY_ORDER.indexOf(b)
      );
      return { date, opponents: matches[0].opponent ?? 'Rival', categories };
    }

    const match = await this.matchModel
      .findById(entityId)
      .select('date opponent name category')
      .lean();
    if (!match) return null;
    const date = this.formatDate(match.date);
    return {
      date,
      opponents: match.opponent ?? 'Rival',
      categories: match.category ? [match.category] : [],
    };
  }

  private async resolveEntityLabel(
    entityType: PaymentEntityTypeEnum,
    entityId: string,
    entityIds?: Types.ObjectId[]
  ): Promise<string> {
    if (entityType === PaymentEntityTypeEnum.MATCH) {
      if (entityIds && entityIds.length > 1) {
        const matches = await this.matchModel
          .find({ _id: { $in: entityIds } })
          .select('date opponent name category')
          .sort({ category: 1 })
          .lean();
        if (!matches.length) return 'Encuentro';
        const date = this.formatDate(matches[0].date);
        const categories = matches.map((m) => m.category).join(', ');
        const opponent = matches[0].opponent ?? 'Rival';
        return `${categories} vs ${opponent} (${date})`;
      }
      const match = await this.matchModel
        .findById(entityId)
        .select('date opponent name category')
        .lean();
      if (!match) return 'Partido';
      const date = this.formatDate(match.date);
      const opponent = match.opponent ? ` vs ${match.opponent}` : '';
      const catLabel = match.category ? `${getCategoryLabel(match.category as CategoryEnum)} ` : '';
      return match.name
        ? `${match.name}${opponent} (${date})`
        : `${catLabel}${opponent.trimStart()} (${date})`;
    }
    if (entityType === PaymentEntityTypeEnum.TRIP) {
      const trip = await this.tripModel
        .findById(entityId)
        .select('name destination departureDate')
        .lean();
      if (!trip) return 'Viaje';
      const date = this.formatDate(trip.departureDate);
      return `${trip.name} — ${trip.destination} (${date})`;
    }
    return entityId;
  }
}
