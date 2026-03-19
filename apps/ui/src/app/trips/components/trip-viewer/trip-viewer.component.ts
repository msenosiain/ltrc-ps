import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  RoleEnum,
  SportEnum,
  Trip,
  TripParticipant,
  TripParticipantStatusEnum,
  TripParticipantTypeEnum,
} from '@ltrc-campo/shared-api-model';
import { TripsService, AddParticipantPayload } from '../../services/trips.service';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { sportOptions } from '../../../common/sport-options';
import { getCategoryLabel } from '../../../common/category-options';
import {
  getParticipantStatusLabel,
  getParticipantTypeLabel,
  getTripStatusLabel,
  participantStatusOptions,
  participantTypeOptions,
} from '../../trip-options';
import { getErrorMessage } from '../../../common/utils/error-message';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'ltrc-trip-viewer',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatDatepickerModule,
    MatTooltipModule,
    AllowedRolesDirective,
  ],
  templateUrl: './trip-viewer.component.html',
  styleUrl: './trip-viewer.component.scss',
})
export class TripViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripsService = inject(TripsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;
  readonly TripParticipantTypeEnum = TripParticipantTypeEnum;
  readonly participantTypeOptions = participantTypeOptions;
  readonly participantStatusOptions = participantStatusOptions;

  trip?: Trip;
  loading = false;

  readonly participantColumns = [
    'name',
    'type',
    'status',
    'cost',
    'paid',
    'balance',
    'actions',
  ];

  // Formulario agregar participante
  addParticipantForm = this.fb.group({
    type: [TripParticipantTypeEnum.PLAYER as TripParticipantTypeEnum, Validators.required],
    playerId: [''],
    userId: [''],
    externalName: [''],
    externalDni: [''],
    externalRole: [''],
    status: [TripParticipantStatusEnum.INTERESTED as TripParticipantStatusEnum],
    costAssigned: [null as number | null],
    specialNeeds: [''],
  });

  // Formulario registrar pago
  paymentForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    notes: [''],
  });

  selectedParticipantForPayment: TripParticipant | null = null;
  showAddParticipant = false;
  showPaymentForm = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/trips']);
      return;
    }
    this.loadTrip(id);
  }

  private loadTrip(id: string): void {
    this.loading = true;
    this.tripsService
      .getTripById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trip) => {
          this.trip = trip;
          this.loading = false;
          // Inicializar costo por defecto en form
          this.addParticipantForm.patchValue({ costAssigned: trip.costPerPerson });
        },
        error: () => this.router.navigate(['/dashboard/trips']),
      });
  }

  // ── Labels ────────────────────────────────────────────────────────────────

  getSportLabel(sport?: SportEnum): string {
    return sportOptions.find((s) => s.id === sport)?.label ?? '';
  }

  getCategoryLabel = getCategoryLabel;
  getStatusLabel = getTripStatusLabel;
  getParticipantTypeLabel = getParticipantTypeLabel;
  getParticipantStatusLabel = getParticipantStatusLabel;

  getParticipantName(p: TripParticipant): string {
    if (p.type === TripParticipantTypeEnum.PLAYER && p.player) {
      return (p.player as any).name ?? `${(p.player as any).lastName}, ${(p.player as any).firstName}`;
    }
    if (p.type === TripParticipantTypeEnum.STAFF) {
      return p.userName ?? '(staff)';
    }
    return p.externalName ?? '(externo)';
  }

  getTotalPaid(p: TripParticipant): number {
    return p.payments?.reduce((sum, pay) => sum + pay.amount, 0) ?? 0;
  }

  getBalance(p: TripParticipant): number {
    return p.costAssigned - this.getTotalPaid(p);
  }

  // ── Resumen ───────────────────────────────────────────────────────────────

  get confirmedCount(): number {
    return this.trip?.participants.filter(
      (p) => p.status === TripParticipantStatusEnum.CONFIRMED
    ).length ?? 0;
  }

  get totalCollected(): number {
    return this.trip?.participants.reduce(
      (sum, p) => sum + this.getTotalPaid(p), 0
    ) ?? 0;
  }

  get totalDebt(): number {
    return this.trip?.participants
      .filter((p) => p.status !== TripParticipantStatusEnum.CANCELLED)
      .reduce((sum, p) => sum + Math.max(0, this.getBalance(p)), 0) ?? 0;
  }

  // ── Acciones participantes ────────────────────────────────────────────────

  toggleAddParticipant(): void {
    this.showAddParticipant = !this.showAddParticipant;
    if (!this.showAddParticipant) this.addParticipantForm.reset({
      type: TripParticipantTypeEnum.PLAYER,
      status: TripParticipantStatusEnum.INTERESTED,
      costAssigned: this.trip?.costPerPerson ?? 0,
    });
  }

  submitAddParticipant(): void {
    if (!this.trip?.id || this.addParticipantForm.invalid) return;
    const v = this.addParticipantForm.getRawValue();

    const payload: AddParticipantPayload = {
      type: v.type!,
      status: v.status ?? undefined,
      costAssigned: v.costAssigned ?? this.trip.costPerPerson,
      specialNeeds: v.specialNeeds || undefined,
    };

    if (v.type === TripParticipantTypeEnum.PLAYER && v.playerId) {
      payload.playerId = v.playerId;
    } else if (v.type === TripParticipantTypeEnum.STAFF && v.userId) {
      payload.userId = v.userId;
    } else if (v.type === TripParticipantTypeEnum.EXTERNAL) {
      payload.externalName = v.externalName || undefined;
      payload.externalDni = v.externalDni || undefined;
      payload.externalRole = v.externalRole || undefined;
    }

    this.tripsService
      .addParticipant(this.trip.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trip) => {
          this.trip = trip;
          this.toggleAddParticipant();
        },
        error: (err) =>
          this.snackBar.open(getErrorMessage(err, 'Error al agregar participante'), 'Cerrar', {
            duration: 4000,
          }),
      });
  }

  updateParticipantStatus(p: TripParticipant, status: TripParticipantStatusEnum): void {
    if (!this.trip?.id || !p.id) return;
    this.tripsService
      .updateParticipant(this.trip.id, p.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (trip) => (this.trip = trip) });
  }

  removeParticipant(p: TripParticipant): void {
    if (!this.trip?.id) return;
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Quitar participante',
          message: `¿Quitar a ${this.getParticipantName(p)} del viaje?`,
          confirmLabel: 'Quitar',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() =>
          this.tripsService.removeParticipant(this.trip!.id!, p.id!)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ next: (trip) => (this.trip = trip) });
  }

  // ── Pagos ─────────────────────────────────────────────────────────────────

  openPaymentForm(p: TripParticipant): void {
    this.selectedParticipantForPayment = p;
    this.showPaymentForm = true;
    this.paymentForm.reset({ amount: null, date: new Date(), notes: '' });
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
    this.selectedParticipantForPayment = null;
  }

  submitPayment(): void {
    if (!this.trip?.id || !this.selectedParticipantForPayment?.id) return;
    if (this.paymentForm.invalid) return;
    const v = this.paymentForm.getRawValue();

    this.tripsService
      .recordPayment(this.trip.id, this.selectedParticipantForPayment.id, {
        amount: v.amount!,
        date: (v.date instanceof Date ? v.date.toISOString().split('T')[0] : v.date) as string,
        notes: v.notes || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trip) => {
          this.trip = trip;
          this.closePaymentForm();
        },
        error: (err) =>
          this.snackBar.open(getErrorMessage(err, 'Error al registrar pago'), 'Cerrar', {
            duration: 4000,
          }),
      });
  }

  removePayment(p: TripParticipant, paymentId: string): void {
    if (!this.trip?.id) return;
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar pago',
          message: '¿Eliminar este pago?',
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() =>
          this.tripsService.removePayment(this.trip!.id!, p.id!, paymentId)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ next: (trip) => (this.trip = trip) });
  }

  // ── Navegación ────────────────────────────────────────────────────────────

  goToEdit(): void {
    this.router.navigate(['/dashboard/trips', this.trip?.id, 'edit']);
  }

  backToList(): void {
    this.router.navigate(['/dashboard/trips']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.backToList();
  }
}
