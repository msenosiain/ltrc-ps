import {
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsyncPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, startWith, map } from 'rxjs';
import {
  CategoryEnum,
  Exercise,
  RoleEnum,
  RoutineStatusEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { ExercisesService } from '../../services/exercises.service';
import { RoutinesService } from '../../services/routines.service';
import { PlayersService } from '../../../players/services/players.service';
import { routineStatusOptions } from '../../physical-training-options';
import { getCategoryOptionsBySport } from '../../../common/category-options';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-routine-form',
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
    MatCheckboxModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './routine-form.component.html',
  styleUrl: './routine-form.component.scss',
})
export class RoutineFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly exercisesService = inject(ExercisesService);
  private readonly routinesService = inject(RoutinesService);
  private readonly playersService = inject(PlayersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;
  readonly statusOptions = routineStatusOptions;
  readonly sportOptions = Object.values(SportEnum).map((v) => ({
    value: v,
    label: v === SportEnum.RUGBY ? 'Rugby' : 'Hockey',
  }));
  readonly daysOfWeek = [
    { value: 'monday', label: 'Lu' },
    { value: 'tuesday', label: 'Ma' },
    { value: 'wednesday', label: 'Mi' },
    { value: 'thursday', label: 'Ju' },
    { value: 'friday', label: 'Vi' },
    { value: 'saturday', label: 'Sá' },
    { value: 'sunday', label: 'Do' },
  ];

  form!: FormGroup;
  editing = false;
  routineId?: string;
  submitting = false;
  allExercises: Exercise[] = [];
  allPlayers: { id: string; name: string }[] = [];
  filteredExercises$: Map<string, Observable<Exercise[]>> = new Map();

  get blocksArray(): FormArray {
    return this.form.get('blocks') as FormArray;
  }

  getExercisesArray(blockIndex: number): FormArray {
    return this.blocksArray.at(blockIndex).get('exercises') as FormArray;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sport: [null],
      category: [null],
      validFrom: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      validUntil: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      daysOfWeek: [[]],
      assignedPlayers: [[]],
      status: [RoutineStatusEnum.DRAFT],
      notes: [''],
      blocks: this.fb.array([]),
    });

    // Load exercises for autocomplete
    this.exercisesService
      .getAllForAutocomplete()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.allExercises = res.items;
      });

    // Load players
    this.playersService
      .getPlayers({ page: 1, size: 500, sortBy: 'name' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.allPlayers = res.items.map((p) => ({ id: p.id!, name: p.name }));
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.routineId = id;
      this.routinesService
        .getRoutineById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((routine) => {
          this.form.patchValue({
            name: routine.name,
            description: routine.description ?? '',
            sport: routine.sport ?? null,
            category: routine.category ?? null,
            validFrom: routine.validFrom,
            validUntil: routine.validUntil,
            daysOfWeek: routine.daysOfWeek ?? [],
            assignedPlayers: (routine.assignedPlayers ?? []).map((p) =>
              typeof p === 'string' ? p : (p as any).id ?? p
            ),
            status: routine.status,
            notes: routine.notes ?? '',
          });

          // Rebuild blocks
          (routine.blocks ?? []).forEach((block) => {
            const blockGroup = this.createBlock(block.title, block.order);
            const exArray = blockGroup.get('exercises') as FormArray;
            (block.exercises ?? []).forEach((entry) => {
              const exerciseId =
                typeof entry.exercise === 'string'
                  ? entry.exercise
                  : (entry.exercise as any)?.id ?? '';
              const entryGroup = this.createExerciseEntry(exerciseId, entry.order);
              entryGroup.patchValue({
                sets: entry.sets ?? null,
                reps: entry.reps ?? '',
                rest: entry.rest ?? '',
                load: entry.load ?? '',
                notes: entry.notes ?? '',
              });
              exArray.push(entryGroup);
              this.setupAutocomplete(entryGroup.get('exerciseSearch') as FormControl);
            });
            this.blocksArray.push(blockGroup);
          });
        });
    }
  }

  private createBlock(title = '', order = 0): FormGroup {
    return this.fb.group({
      title: [title, Validators.required],
      order: [order],
      exercises: this.fb.array([]),
    });
  }

  private createExerciseEntry(exerciseId = '', order = 0): FormGroup {
    return this.fb.group({
      exercise: [exerciseId, Validators.required],
      exerciseSearch: [''],
      order: [order],
      sets: [null],
      reps: [''],
      duration: [''],
      rest: [''],
      load: [''],
      notes: [''],
    });
  }

  private setupAutocomplete(searchControl: FormControl): void {
    const key = Math.random().toString(36).slice(2);
    (searchControl as any).__key = key;
    const obs = searchControl.valueChanges.pipe(
      startWith(''),
      map((val) => {
        const term = (typeof val === 'string' ? val : '').toLowerCase();
        return this.allExercises.filter((e) => e.name.toLowerCase().includes(term)).slice(0, 30);
      })
    );
    this.filteredExercises$.set(key, obs);
  }

  getFilteredExercises(entryGroup: AbstractControl): Observable<Exercise[]> {
    const ctrl = entryGroup.get('exerciseSearch') as FormControl;
    const key = (ctrl as any).__key;
    if (!key || !this.filteredExercises$.has(key)) {
      this.setupAutocomplete(ctrl);
      return this.filteredExercises$.get((ctrl as any).__key)!;
    }
    return this.filteredExercises$.get(key)!;
  }

  onExerciseSelected(exerciseId: string, entryGroup: AbstractControl): void {
    entryGroup.get('exercise')!.setValue(exerciseId);
  }

  displayExercise(exerciseId: string): string {
    const found = this.allExercises.find((e) => e.id === exerciseId);
    return found?.name ?? exerciseId ?? '';
  }

  addBlock(): void {
    const blockGroup = this.createBlock('Bloque ' + (this.blocksArray.length + 1), this.blocksArray.length);
    this.blocksArray.push(blockGroup);
  }

  removeBlock(index: number): void {
    this.blocksArray.removeAt(index);
  }

  addExerciseEntry(blockIndex: number): void {
    const exArray = this.getExercisesArray(blockIndex);
    const entryGroup = this.createExerciseEntry('', exArray.length);
    this.setupAutocomplete(entryGroup.get('exerciseSearch') as FormControl);
    exArray.push(entryGroup);
  }

  removeExerciseEntry(blockIndex: number, entryIndex: number): void {
    this.getExercisesArray(blockIndex).removeAt(entryIndex);
  }

  isDaySelected(day: string): boolean {
    const days: string[] = this.form.get('daysOfWeek')?.value ?? [];
    return days.includes(day);
  }

  toggleDay(day: string): void {
    const days: string[] = [...(this.form.get('daysOfWeek')?.value ?? [])];
    const idx = days.indexOf(day);
    if (idx >= 0) days.splice(idx, 1);
    else days.push(day);
    this.form.get('daysOfWeek')?.setValue(days);
  }

  getCategoryOptions() {
    const sport = this.form.get('sport')?.value;
    return getCategoryOptionsBySport(sport);
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
      validFrom: raw.validFrom,
      validUntil: raw.validUntil,
      daysOfWeek: raw.daysOfWeek ?? [],
      assignedPlayers: raw.assignedPlayers ?? [],
      status: raw.status,
      notes: raw.notes || undefined,
      blocks: (raw.blocks ?? []).map((block: any, bi: number) => ({
        title: block.title,
        order: bi,
        exercises: (block.exercises ?? []).map((entry: any, ei: number) => ({
          exercise: entry.exercise,
          order: ei,
          sets: entry.sets ?? undefined,
          reps: entry.reps || undefined,
          duration: entry.duration || undefined,
          rest: entry.rest || undefined,
          load: entry.load || undefined,
          notes: entry.notes || undefined,
        })),
      })),
    };

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(getErrorMessage(err, 'Error al guardar la rutina'), 'Cerrar', { duration: 5000 });
    };

    if (this.editing && this.routineId) {
      this.routinesService
        .updateRoutine(this.routineId, dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/physical/routines']);
          },
          error: onError,
        });
      return;
    }

    this.routinesService
      .createRoutine(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard/physical/routines']);
        },
        error: onError,
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/physical/routines']);
  }
}
