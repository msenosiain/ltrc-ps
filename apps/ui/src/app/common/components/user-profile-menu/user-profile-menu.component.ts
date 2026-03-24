import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../auth/auth.service';
import { ViewAsRoleService } from '../../../auth/services/view-as-role.service';
import { getRoleLabel, getRoleClass, roleOptions } from '../../../users/user-options';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Component({
  selector: 'ltrc-user-profile-menu',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './user-profile-menu.component.html',
  styleUrl: './user-profile-menu.component.scss',
})
export class UserProfileMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly viewAsService = inject(ViewAsRoleService);

  readonly currentUser = toSignal(this.authService.user$);
  readonly isAdmin = computed(
    () => this.currentUser()?.roles?.includes(RoleEnum.ADMIN) ?? false
  );
  readonly canSetPassword = computed(
    () => this.currentUser() !== null && !this.currentUser()?.hasPassword
  );
  readonly primaryRoleLabel = computed(() => {
    const user = this.currentUser();
    return user?.roles?.length ? getRoleLabel(user.roles[0]) : '';
  });
  readonly primaryRoleClass = computed(() => {
    const user = this.currentUser();
    return user?.roles?.length ? getRoleClass(user.roles[0]) : '';
  });

  readonly viewAsRoleOptions = roleOptions.filter((r) => r.id !== RoleEnum.ADMIN);

  logout(): void {
    this.viewAsService.clear();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
