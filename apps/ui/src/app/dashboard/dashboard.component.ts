import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { BlockEnum, CategoryEnum, getCategoryBlock, RoleEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../auth/directives/allowed-roles.directive';
import { AuthService } from '../auth/auth.service';
import { ViewAsRoleService } from '../auth/services/view-as-role.service';
import { getRoleLabel } from '../users/user-options';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PlayersService } from '../players/services/players.service';
import { SidenavService } from '../common/services/sidenav.service';
import { UpcomingTrainingsWidgetComponent } from '../trainings/components/upcoming-trainings-widget/upcoming-trainings-widget.component';
import { UpcomingMatchesWidgetComponent } from '../matches/components/upcoming-matches-widget/upcoming-matches-widget.component';
import { MyMatchesWidgetComponent } from '../matches/components/my-matches-widget/my-matches-widget.component';
import { PlayerStatsWidgetComponent } from '../players/components/player-stats-widget/player-stats-widget.component';
import { AttendanceStatsWidgetComponent } from '../trainings/components/attendance-stats-widget/attendance-stats-widget.component';
import { MatchAttendanceStatsWidgetComponent } from '../matches/components/match-attendance-stats-widget/match-attendance-stats-widget.component';
import { MyWorkoutWidgetComponent } from '../physical-training/components/my-workout-widget/my-workout-widget.component';

@Component({
  selector: 'ltrc-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    AllowedRolesDirective,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    UpcomingTrainingsWidgetComponent,
    UpcomingMatchesWidgetComponent,
    MyMatchesWidgetComponent,
    PlayerStatsWidgetComponent,
    AttendanceStatsWidgetComponent,
    MatchAttendanceStatsWidgetComponent,
    MyWorkoutWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  RoleEnum = RoleEnum;
  SportEnum = SportEnum;
  public authService = inject(AuthService);
  public router = inject(Router);
  readonly viewAsService = inject(ViewAsRoleService);
  private readonly playersService = inject(PlayersService);
  private readonly sidenavService = inject(SidenavService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly currentUser = toSignal(this.authService.user$);

  readonly isAdmin = computed(
    () => this.currentUser()?.roles?.includes(RoleEnum.ADMIN) ?? false
  );

  readonly isPlayer = computed(() => {
    const viewAs = this.viewAsService.viewAsRole();
    if (viewAs) return viewAs === RoleEnum.PLAYER;
    return this.currentUser()?.roles?.includes(RoleEnum.PLAYER) ?? false;
  });

  readonly isCoordinator = computed(() => {
    const viewAs = this.viewAsService.viewAsRole();
    if (viewAs) return viewAs === RoleEnum.COORDINATOR;
    return this.currentUser()?.roles?.includes(RoleEnum.COORDINATOR) ?? false;
  });

  readonly canViewStats = computed(() => {
    const viewAs = this.viewAsService.viewAsRole();
    const roles = this.currentUser()?.roles ?? [];
    const check = (r: RoleEnum) => viewAs ? viewAs === r : roles.includes(r);
    return check(RoleEnum.COORDINATOR) || check(RoleEnum.MANAGER) || check(RoleEnum.TRAINER) || check(RoleEnum.COACH);
  });

  readonly hasNoRoles = computed(() => {
    const viewAs = this.viewAsService.viewAsRole();
    if (viewAs) return false;
    return !this.currentUser()?.roles?.length;
  });

  readonly canSetPassword = computed(
    () => this.currentUser() !== null && !this.currentUser()?.hasPassword
  );

  readonly viewAsRoleLabel = computed(() => {
    const role = this.viewAsService.viewAsRole();
    return role ? getRoleLabel(role) : null;
  });

  myPlayerId = signal<string | null>(null);
  private myPlayerCategory = signal<CategoryEnum | null>(null);
  readonly isInfantil = computed(
    () => getCategoryBlock(this.myPlayerCategory() as CategoryEnum) === BlockEnum.INFANTILES
  );

  private readonly breakpointObserver = inject(BreakpointObserver);
  isSmallScreen = toSignal(
    this.breakpointObserver
      .observe('(max-width: 960px)')
      .pipe(map((result) => result.matches)),
    { initialValue: this.breakpointObserver.isMatched('(max-width: 960px)') }
  );

  onViewAsChange(role: RoleEnum | null): void {
    this.viewAsService.set(role);
  }

  onNavClick(): void {
    if (this.isSmallScreen()) {
      this.sidenav?.close();
    }
  }

  ngOnInit(): void {
    this.sidenavService.toggle$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.sidenav?.toggle());

    if (this.isPlayer()) {
      this.playersService.getMyPlayer().subscribe({
        next: (player) => {
          this.myPlayerId.set(player.id ?? null);
          this.myPlayerCategory.set((player.category as CategoryEnum) ?? null);
        },
        error: () => {
          /* jugador sin perfil vinculado, se queda en dashboard */
        },
      });
    }
  }
}
