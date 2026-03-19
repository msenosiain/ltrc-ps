import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {
  CategoryEnum,
  SportEnum,
  Trip,
  TripStatusEnum,
} from '@ltrc-ps/shared-api-model';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { SportOption, sportOptions } from '../../../common/sport-options';
import {
  CategoryOption,
  getCategoryOptionsBySport,
} from '../../../common/category-options';
import {
  TripOption,
  tripStatusOptions,
} from '../../trip-options';
import { CreateTripPayload } from '../../services/trips.service';

@Component({
  selector: 'ltrc-trip-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './trip-form.component.html',
  styleUrl: './trip-form.component.scss',
})
export class TripFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input() trip?: Trip;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<CreateTripPayload>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly sportOptions: SportOption[] = sportOptions;
  readonly statusOptions: TripOption<TripStatusEnum>[] = tripStatusOptions;
  categoryOptions: CategoryOption[] = getCategoryOptionsBySport();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    destination: ['', Validators.required],
    sport: [null as SportEnum | null],
    categories: [[] as CategoryEnum[]],
    departureDate: [null, Validators.required],
    returnDate: [null],
    registrationDeadline: [null],
    costPerPerson: [0, [Validators.required, Validators.min(0)]],
    maxParticipants: [null],
    status: [TripStatusEnum.DRAFT],
    description: [''],
  });

  ngOnInit(): void {
    this.form
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport: SportEnum | null) => {
        this.categoryOptions = getCategoryOptionsBySport(sport);
        const selected: CategoryEnum[] = this.form.get('categories')?.value ?? [];
        const validIds = new Set(this.categoryOptions.map((c) => c.id));
        const stillValid = selected.filter((c) => validIds.has(c));
        if (stillValid.length !== selected.length) {
          this.form.get('categories')?.setValue(stillValid);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trip'] && this.trip) {
      this.categoryOptions = getCategoryOptionsBySport(this.trip.sport);
      this.form.patchValue({
        ...this.trip,
        departureDate: this.trip.departureDate ? new Date(this.trip.departureDate) : null,
        returnDate: this.trip.returnDate ? new Date(this.trip.returnDate) : null,
        registrationDeadline: this.trip.registrationDeadline
          ? new Date(this.trip.registrationDeadline)
          : null,
        categories: this.trip.categories ?? [],
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload: CreateTripPayload = {
      name: v.name,
      destination: v.destination,
      sport: v.sport ?? undefined,
      categories: v.categories?.length ? v.categories : undefined,
      departureDate: v.departureDate ? format(new Date(v.departureDate), 'yyyy-MM-dd') : '',
      returnDate: v.returnDate ? format(new Date(v.returnDate), 'yyyy-MM-dd') : undefined,
      registrationDeadline: v.registrationDeadline
        ? format(new Date(v.registrationDeadline), 'yyyy-MM-dd')
        : undefined,
      costPerPerson: v.costPerPerson ?? 0,
      maxParticipants: v.maxParticipants ?? undefined,
      status: v.status,
      description: v.description ?? undefined,
    };
    this.formSubmit.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
