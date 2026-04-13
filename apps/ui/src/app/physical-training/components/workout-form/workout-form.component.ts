import {
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { format } from 'date-fns';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, startWith } from 'rxjs';
import {
  DayOfWeekEnum,
  HockeyBranchEnum,
  WorkoutStatusEnum,
  SportEnum,
  SortOrder,
} from '@ltrc-campo/shared-api-model';
import { WorkoutsService } from '../../services/workouts.service';
import { PlayersService } from '../../../players/services/players.service';
import { workoutStatusOptions } from '../../physical-training-options';
import { getCategoryOptionsBySport } from '../../../common/category-options';
import { getErrorMessage } from '../../../common/utils/error-message';
import { getPositionOptionsBySport, PositionOption } from '../../../players/position-options';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';

@Component({
  selector: 'ltrc-workout-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatDatepickerModule,
  ],
  templateUrl: './workout-form.component.html',
  styleUrl: './workout-form.component.scss',
})
export class WorkoutFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly playersService = inject(PlayersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userFilterContext = inject(UserFilterContextService);

  readonly statusOptions = workoutStatusOptions;
  sportOptions = Object.values(SportEnum).map((v) => ({
    value: v,
    label: v === SportEnum.RUGBY ? 'Rugby' : 'Hockey',
  }));
  readonly branchOptions = Object.values(HockeyBranchEnum);
  readonly dayOptions = [
    { value: DayOfWeekEnum.MONDAY, label: 'Lunes' },
    { value: DayOfWeekEnum.TUESDAY, label: 'Martes' },
    { value: DayOfWeekEnum.WEDNESDAY, label: 'Miércoles' },
    { value: DayOfWeekEnum.THURSDAY, label: 'Jueves' },
    { value: DayOfWeekEnum.FRIDAY, label: 'Viernes' },
    { value: DayOfWeekEnum.SATURDAY, label: 'Sábado' },
    { value: DayOfWeekEnum.SUNDAY, label: 'Domingo' },
  ];

  form!: FormGroup;
  editing = false;
  workoutId?: string;
  submitting = false;
  allPlayers: { id: string; name: string }[] = [];
  validUntilMin: Date | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sport: [null],
      category: [null],
      validFrom: [null as Date | null, Validators.required],
      validUntil: [null as Date | null, Validators.required],
      daysOfWeek: [[]],
      assignedPlayers: [[]],
      assignedBranches: [[]],
      targetPositions: [[]],
      status: [WorkoutStatusEnum.DRAFT],
      notes: [''],
    });

    combineLatest([
      this.form.get('sport')!.valueChanges.pipe(startWith(null)),
      this.form.get('category')!.valueChanges.pipe(startWith(null)),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([sport, category]) => {
        const filters: Record<string, unknown> = {};
        if (sport) filters['sport'] = sport;
        if (category) filters['category'] = category;
        this.playersService
          .getPlayers({ page: 1, size: 500, sortBy: 'name', sortOrder: SortOrder.ASC, filters })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) => {
            this.allPlayers = res.items.map((p) => ({ id: p.id!, name: p.name }));
          });
      });

    this.form.get('validFrom')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: Date | null) => {
        this.validUntilMin = val ?? null;
        const until = this.form.get('validUntil')!.value as Date | null;
        if (val && until && until < val) {
          this.form.get('validUntil')!.setValue(val);
        }
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.workoutId = id;
    }

    this.userFilterContext.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.sportOptions = ctx.sportOptions.map((s) => ({ value: s.id, label: s.label }));
        if (!this.editing) {
          const patch: Record<string, unknown> = {};
          if (ctx.forcedSport) patch['sport'] = ctx.forcedSport;
          if (ctx.forcedCategory) patch['category'] = ctx.forcedCategory;
          if (Object.keys(patch).length) this.form.patchValue(patch);
        }
      });

    if (id) {
      this.workoutsService
        .getWorkoutById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((workout) => {
          this.form.patchValue({
            name: workout.name,
            description: workout.description ?? '',
            sport: workout.sport ?? null,
            category: workout.category ?? null,
            validFrom: workout.validFrom ? new Date(workout.validFrom) : null,
            validUntil: workout.validUntil ? new Date(workout.validUntil) : null,
            assignedPlayers: (workout.assignedPlayers ?? []).map((p) =>
              typeof p === 'string' ? p : (p as any).id ?? p
            ),
            daysOfWeek: workout.daysOfWeek ?? [],
            assignedBranches: workout.assignedBranches ?? [],
            targetPositions: workout.targetPositions ?? [],
            status: workout.status,
            notes: workout.notes ?? '',
          });
        });
    }
  }

  getCategoryOptions() {
    const sport = this.form.get('sport')?.value;
    return getCategoryOptionsBySport(sport);
  }

  getPositionOptions(): PositionOption[] {
    const sport = this.form.get('sport')?.value as SportEnum | null;
    return getPositionOptionsBySport(sport);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.value;
    const dto: any = {
      name: raw.name,
      description: raw.description || undefined,
      sport: raw.sport || undefined,
      category: raw.category || undefined,
      validFrom: raw.validFrom ? format(raw.validFrom, 'yyyy-MM-dd') : undefined,
      validUntil: raw.validUntil ? format(raw.validUntil, 'yyyy-MM-dd') : undefined,
      daysOfWeek: raw.daysOfWeek ?? [],
      assignedPlayers: raw.assignedPlayers ?? [],
      assignedBranches: raw.assignedBranches ?? [],
      targetPositions: raw.targetPositions ?? [],
      status: raw.status,
      notes: raw.notes || undefined,
    };

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(getErrorMessage(err, 'Error al guardar'), 'Cerrar', { duration: 5000 });
    };

    if (this.editing && this.workoutId) {
      this.workoutsService
        .updateWorkout(this.workoutId, dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/physical/workouts', this.workoutId, 'blocks']);
          },
          error: onError,
        });
      return;
    }

    this.workoutsService
      .createWorkout(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: any) => {
          this.submitting = false;
          this.router.navigate(['/dashboard/physical/workouts', created.id, 'blocks']);
        },
        error: onError,
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/physical/workouts']);
  }
}
