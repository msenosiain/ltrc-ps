import {
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExercisesService } from '../../services/exercises.service';
import { exerciseCategoryOptions, exerciseTrackingTypeOptions } from '../../physical-training-options';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-exercise-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './exercise-form.component.html',
  styleUrl: './exercise-form.component.scss',
})
export class ExerciseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly exercisesService = inject(ExercisesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryOptions = exerciseCategoryOptions;
  readonly trackingTypeOptions = exerciseTrackingTypeOptions;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  form!: FormGroup;
  editing = false;
  exerciseId?: string;
  submitting = false;
  muscleGroups: string[] = [];
  equipment: string[] = [];
  videos: { url: string; title: string }[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      trackingType: ['reps', Validators.required],
      description: [''],
      instructions: [''],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.exerciseId = id;
      this.exercisesService
        .getExerciseById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((exercise) => {
          this.form.patchValue({
            name: exercise.name,
            category: exercise.category,
            trackingType: exercise.trackingType ?? 'reps',
            description: exercise.description ?? '',
            instructions: exercise.instructions ?? '',
          });
          this.muscleGroups = [...(exercise.muscleGroups ?? [])];
          this.equipment = [...(exercise.equipment ?? [])];
          this.videos = (exercise.videos ?? []).map((v) => ({ url: v.url, title: v.title ?? '' }));
        });
    }
  }

  addMuscleGroup(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) this.muscleGroups.push(value);
    event.chipInput!.clear();
  }

  removeMuscleGroup(group: string): void {
    const idx = this.muscleGroups.indexOf(group);
    if (idx >= 0) this.muscleGroups.splice(idx, 1);
  }

  addEquipment(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) this.equipment.push(value);
    event.chipInput!.clear();
  }

  removeEquipment(item: string): void {
    const idx = this.equipment.indexOf(item);
    if (idx >= 0) this.equipment.splice(idx, 1);
  }

  addVideo(): void {
    this.videos.push({ url: '', title: '' });
  }

  removeVideo(index: number): void {
    this.videos.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const dto = {
      ...this.form.value,
      muscleGroups: this.muscleGroups,
      equipment: this.equipment,
      videos: this.videos.filter((v) => v.url.trim()).map((v) => ({ url: v.url.trim(), title: v.title.trim() || undefined })),
    };

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(
        getErrorMessage(err, 'Error al guardar el ejercicio'),
        'Cerrar',
        { duration: 5000 }
      );
    };

    if (this.editing && this.exerciseId) {
      this.exercisesService
        .updateExercise(this.exerciseId, dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/physical/exercises']);
          },
          error: onError,
        });
      return;
    }

    this.exercisesService
      .createExercise(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard/physical/exercises']);
        },
        error: onError,
      });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/physical/exercises']);
  }
}
