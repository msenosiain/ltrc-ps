import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../services/users.service';
import { User } from '../../User.interface';
import { Role } from '../../../auth/roles.enum';
import { getRoleLabel } from '../../user-options';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { Player } from '@ltrc-ps/shared-api-model';

@Component({
  selector: 'ltrc-user-viewer',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './user-viewer.component.html',
  styleUrl: './user-viewer.component.scss',
})
export class UserViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  user?: User;
  linkedPlayer?: Player | null;
  readonly Role = Role;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/users']);
      return;
    }

    this.usersService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.loadLinkedPlayer(id);
        },
        error: () => this.router.navigate(['/dashboard/users']),
      });
  }

  private loadLinkedPlayer(userId: string): void {
    this.usersService
      .getLinkedPlayer(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (player) => (this.linkedPlayer = player),
        error: () => (this.linkedPlayer = null),
      });
  }

  edit(): void {
    this.router.navigate(['/dashboard/users', this.user!.id, 'edit']);
  }

  onResetPassword(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Restablecer contraseña',
        message: `¿Estás seguro que querés restablecer la contraseña de ${this.user?.name} ${this.user?.lastName}? El usuario deberá activar su cuenta nuevamente.`,
        confirmLabel: 'Restablecer',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.usersService
          .resetPassword(this.user!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () =>
              this.snackBar.open(
                'Contraseña restablecida correctamente',
                'Cerrar',
                {
                  duration: 4000,
                }
              ),
            error: () =>
              this.snackBar.open(
                'Error al restablecer la contraseña',
                'Cerrar',
                {
                  duration: 4000,
                }
              ),
          });
      });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/users']);
  }

  getRoleLabel(role: Role): string {
    return getRoleLabel(role);
  }

  getRoleColor(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'warn';
      case Role.USER:
        return 'primary';
      case Role.PLAYER:
        return 'accent';
      default:
        return 'primary';
    }
  }

  getPlayerId(player: Player): string {
    return (player as any)._id ?? (player as any).id ?? '';
  }
}
