import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, debounceTime, startWith, map } from 'rxjs';
import { Exercise, RoleEnum, Workout, WorkoutStatusEnum } from '@ltrc-campo/shared-api-model';
import { WorkoutsService } from '../../services/workouts.service';
import { ExercisesService } from '../../services/exercises.service';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { getWorkoutStatusLabel } from '../../physical-training-options';

interface SetDraft {
  reps: string;
  duration: string;
  load: string;
}

interface ExerciseDraft {
  exerciseId: string;
  exerciseName: string;
  sets: SetDraft[];
  rest: string;
  notes: string;
}

interface BlockDraft {
  title: string;
  exercises: ExerciseDraft[];
  searchControl: FormControl<string | null>;
  filteredExercises$: Observable<Exercise[]>;
}

@Component({
  selector: 'ltrc-workout-blocks-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    AsyncPipe,
    AllowedRolesDirective,
  ],
  templateUrl: './workout-blocks-editor.component.html',
  styleUrl: './workout-blocks-editor.component.scss',
})
export class WorkoutBlocksEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly exercisesService = inject(ExercisesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;

  workoutId!: string;
  workout?: Workout;
  blocks: BlockDraft[] = [];
  allExercises: Exercise[] = [];

  loading = true;
  saving = false;

  private saveSubject = new Subject<void>();

  ngOnInit(): void {
    this.workoutId = this.route.snapshot.paramMap.get('id')!;

    this.saveSubject
      .pipe(debounceTime(800), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.doSave());

    this.exercisesService
      .getAllForAutocomplete()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.allExercises = res.items;
      });

    this.workoutsService
      .getWorkoutById(this.workoutId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (workout) => {
          this.workout = workout;
          this.blocks = (workout.blocks ?? [])
            .sort((a, b) => a.order - b.order)
            .map((b) => this.blockToModel(b));
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/dashboard/physical/workouts']);
        },
      });
  }

  private blockToModel(b: any): BlockDraft {
    const draft: BlockDraft = {
      title: b.title,
      exercises: (b.exercises ?? []).map((e: any) => ({
        exerciseId: typeof e.exercise === 'string' ? e.exercise : (e.exercise?.id ?? ''),
        exerciseName: typeof e.exercise === 'string' ? e.exercise : (e.exercise?.name ?? ''),
        sets: (e.sets ?? [{ reps: '', duration: '', load: '' }]).map((s: any) => ({
          reps: s.reps ?? '',
          duration: s.duration ?? '',
          load: s.load ?? '',
        })),
        rest: e.rest ?? '',
        notes: e.notes ?? '',
      })),
      searchControl: new FormControl<string | null>(''),
      filteredExercises$: null as any,
    };
    draft.filteredExercises$ = this.buildFilteredExercises(draft.searchControl);
    return draft;
  }

  private buildFilteredExercises(ctrl: FormControl): Observable<Exercise[]> {
    return ctrl.valueChanges.pipe(
      startWith(''),
      map((val) => {
        const term = (typeof val === 'string' ? val : '').toLowerCase();
        if (!term) return this.allExercises.slice(0, 30);
        return this.allExercises.filter((e) => e.name.toLowerCase().includes(term)).slice(0, 30);
      })
    );
  }

  scheduleSave(): void {
    this.saveSubject.next();
  }

  private doSave(): void {
    this.saving = true;
    const blocks = this.buildBlocksDto();
    this.workoutsService
      .updateWorkout(this.workoutId, { blocks })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.saving = false; },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        },
      });
  }

  private buildBlocksDto() {
    return this.blocks.map((b, i) => ({
      title: b.title,
      order: i,
      exercises: b.exercises.map((e, ei) => ({
        exercise: e.exerciseId,
        order: ei,
        sets: e.sets.map((s) => ({
          reps: s.reps || undefined,
          duration: s.duration || undefined,
          load: s.load || undefined,
        })),
        rest: e.rest || undefined,
        notes: e.notes || undefined,
      })),
    }));
  }

  addBlock(): void {
    const draft: BlockDraft = {
      title: `Bloque ${this.blocks.length + 1}`,
      exercises: [],
      searchControl: new FormControl<string | null>(''),
      filteredExercises$: null as any,
    };
    draft.filteredExercises$ = this.buildFilteredExercises(draft.searchControl);
    this.blocks.push(draft);
    this.scheduleSave();
  }

  removeBlock(bi: number): void {
    this.blocks.splice(bi, 1);
    this.scheduleSave();
  }

  moveBlockUp(bi: number): void {
    if (bi === 0) return;
    [this.blocks[bi - 1], this.blocks[bi]] = [this.blocks[bi], this.blocks[bi - 1]];
    this.scheduleSave();
  }

  moveBlockDown(bi: number): void {
    if (bi === this.blocks.length - 1) return;
    [this.blocks[bi], this.blocks[bi + 1]] = [this.blocks[bi + 1], this.blocks[bi]];
    this.scheduleSave();
  }

  onExerciseSelected(bi: number, exercise: Exercise): void {
    this.blocks[bi].exercises.push({
      exerciseId: exercise.id!,
      exerciseName: exercise.name,
      sets: [{ reps: '', duration: '', load: '' }],
      rest: '',
      notes: '',
    });
    this.blocks[bi].searchControl.setValue('');
    this.scheduleSave();
  }

  removeExercise(bi: number, ei: number): void {
    this.blocks[bi].exercises.splice(ei, 1);
    this.scheduleSave();
  }

  addSet(bi: number, ei: number): void {
    this.blocks[bi].exercises[ei].sets.push({ reps: '', duration: '', load: '' });
    this.scheduleSave();
  }

  duplicateLastSet(bi: number, ei: number): void {
    const sets = this.blocks[bi].exercises[ei].sets;
    const last = sets[sets.length - 1];
    sets.push({ ...last });
    this.scheduleSave();
  }

  removeSet(bi: number, ei: number, si: number): void {
    this.blocks[bi].exercises[ei].sets.splice(si, 1);
    this.scheduleSave();
  }

  displayExercise(ex: Exercise | null): string {
    return ex?.name ?? '';
  }

  getStatusLabel(status: string): string {
    return getWorkoutStatusLabel(status);
  }

  onPublish(): void {
    this.saving = true;
    const blocks = this.buildBlocksDto();
    this.workoutsService
      .updateWorkout(this.workoutId, { blocks, status: WorkoutStatusEnum.ACTIVE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Rutina publicada', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard/physical/workouts', this.workoutId]);
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al publicar', 'Cerrar', { duration: 5000 });
        },
      });
  }

  onSaveDraft(): void {
    this.saveSubject.next();
    this.router.navigate(['/dashboard/physical/workouts', this.workoutId]);
  }

  onDiscard(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Descartar rutina',
        message: '¿Estás seguro que querés eliminar esta rutina? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.workoutsService
        .deleteWorkout(this.workoutId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.router.navigate(['/dashboard/physical/workouts']),
          error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 5000 }),
        });
    });
  }

  onEditInfo(): void {
    this.router.navigate(['/dashboard/physical/workouts', this.workoutId, 'edit']);
  }
}
