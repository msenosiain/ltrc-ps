import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormSkeletonComponent } from '../../../common/components/form-skeleton/form-skeleton.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../services/users.service';
import { User } from '../../User.interface';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserFormValue } from '../../forms/user-form.types';
import {
  mapFormToCreateUserDto,
  mapFormToUpdateUserDto,
} from '../../forms/user-form.mapper';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-user-editor',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    UserFormComponent,
    FormSkeletonComponent,
  ],
  templateUrl: './user-editor.component.html',
  styleUrl: './user-editor.component.scss',
})
export class UserEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  user?: User;
  editing = false;
  submitting = false;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (id) {
      this.loading = true;
      this.usersService
        .getUserById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (user) => { this.user = user; this.loading = false; }, error: () => { this.loading = false; } });
    }
  }

  onFormSubmit(value: UserFormValue): void {
    this.submitting = true;

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(getErrorMessage(err, 'Error al guardar el usuario'), 'Cerrar', { duration: 5000 });
    };

    if (this.editing && this.user?.id) {
      const dto = mapFormToUpdateUserDto(value);
      this.usersService
        .updateUser(this.user.id, dto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.submitting = false;
            this.router.navigate(['/dashboard/users', updated.id]);
          },
          error: onError,
        });
      return;
    }

    const dto = mapFormToCreateUserDto(value);
    this.usersService
      .createUser(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.submitting = false;
          this.router.navigate([
            '/dashboard/users',
            (created as any)._id ?? (created as any).id,
          ]);
        },
        error: onError,
      });
  }

  onDelete(): void {
    const name = this.user?.name ?? '';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro que querés eliminar a ${name}? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService
          .deleteUser(this.user!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard/users']));
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
