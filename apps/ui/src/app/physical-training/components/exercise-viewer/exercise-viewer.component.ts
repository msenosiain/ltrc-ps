import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Exercise, RoleEnum } from '@ltrc-campo/shared-api-model';
import { ExercisesService } from '../../services/exercises.service';
import { getExerciseCategoryLabel } from '../../physical-training-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ltrc-exercise-viewer',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    AllowedRolesDirective,
  ],
  templateUrl: './exercise-viewer.component.html',
  styleUrl: './exercise-viewer.component.scss',
})
export class ExerciseViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exercisesService = inject(ExercisesService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;

  exercise?: Exercise;
  loading = true;
  selectedVideoIndex = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.exercisesService
      .getExerciseById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exercise) => {
          this.exercise = exercise;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/dashboard/physical/exercises']);
        },
      });
  }

  getEmbedUrl(url: string): SafeResourceUrl | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
    if (ytMatch) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
      );
    }
    if (url.includes('youtube.com/embed/')) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  isDirectVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  }

  getCategoryLabel(cat: string): string {
    return getExerciseCategoryLabel(cat);
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/physical/exercises', this.exercise!.id, 'edit']);
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar ejercicio',
        message: '¿Estás seguro que querés eliminar este ejercicio? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.exercisesService
        .deleteExercise(this.exercise!.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Ejercicio eliminado', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/physical/exercises']);
          },
          error: () => {
            this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/physical/exercises']);
  }
}
