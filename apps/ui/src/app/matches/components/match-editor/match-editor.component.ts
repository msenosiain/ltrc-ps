import { Component, HostListener, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { MatchFormValue } from '../../forms/match-form.types';
import { Match } from '@ltrc-ps/shared-api-model';
import { MatchFormComponent } from '../match-form/match-form.component';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-match-editor',
  standalone: true,
  imports: [MatProgressBarModule, MatButtonModule, MatIconModule, MatchFormComponent],
  templateUrl: './match-editor.component.html',
  styleUrl: './match-editor.component.scss',
})
export class MatchEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly matchesService = inject(MatchesService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  match?: Match;
  editing = false;
  submitting = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (id) {
      this.matchesService
        .getMatchById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((match) => (this.match = match));
    }
  }

  onFormSubmit(payload: MatchFormValue): void {
    this.submitting = true;

    const onError = () => (this.submitting = false);

    if (this.editing && this.match?.id) {
      this.matchesService
        .updateMatch(this.match.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => { this.submitting = false; this.router.navigate(['/dashboard/matches']); },
          error: onError,
        });
      return;
    }

    this.matchesService
      .createMatch(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.submitting = false; this.router.navigate(['/dashboard/matches']); },
        error: onError,
      });
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar partido',
        message: `¿Estás seguro que querés eliminar el partido contra "${this.match?.opponent}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.matchesService
          .deleteMatch(this.match!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard/matches']));
      });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}