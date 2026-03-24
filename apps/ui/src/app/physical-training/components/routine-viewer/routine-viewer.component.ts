import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Exercise, RoleEnum, Routine, RoutineBlock } from '@ltrc-campo/shared-api-model';
import { RoutinesService } from '../../services/routines.service';
import { getRoutineStatusLabel } from '../../physical-training-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ltrc-routine-viewer',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCardModule,
    MatTableModule,
    AllowedRolesDirective,
  ],
  templateUrl: './routine-viewer.component.html',
  styleUrl: './routine-viewer.component.scss',
})
export class RoutineViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routinesService = inject(RoutinesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;
  readonly exerciseColumns = ['exercise', 'sets', 'reps', 'rest', 'load', 'notes'];

  routine?: Routine;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.routinesService
      .getRoutineById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (routine) => {
          this.routine = routine;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/dashboard/physical/routines']);
        },
      });
  }

  getStatusLabel(status: string): string {
    return getRoutineStatusLabel(status);
  }

  getExerciseName(exercise: Exercise | string): string {
    if (typeof exercise === 'string') return exercise;
    return (exercise as Exercise).name ?? '';
  }

  getAssignedPlayers(): string[] {
    return (this.routine?.assignedPlayers ?? []).map((p) => {
      if (typeof p === 'string') return p;
      return (p as any).name ?? (p as any).id ?? '';
    });
  }

  getSortedBlocks(): RoutineBlock[] {
    return [...(this.routine?.blocks ?? [])].sort((a, b) => a.order - b.order);
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/physical/routines', this.routine!.id, 'edit']);
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar rutina',
        message: '¿Estás seguro que querés eliminar esta rutina? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.routinesService
        .deleteRoutine(this.routine!.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Rutina eliminada', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/physical/routines']);
          },
          error: () => {
            this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/physical/routines']);
  }
}
