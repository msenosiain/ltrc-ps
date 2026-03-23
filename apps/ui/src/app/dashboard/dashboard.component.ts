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
import { RoleEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../auth/directives/allowed-roles.directive';
import { AuthService } from '../auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PlayersService } from '../players/services/players.service';
import { SidenavService } from '../common/services/sidenav.service';
import { UpcomingTrainingsWidgetComponent } from '../trainings/components/upcoming-trainings-widget/upcoming-trainings-widget.component';
import { UpcomingMatchesWidgetComponent } from '../matches/components/upcoming-matches-widget/upcoming-matches-widget.component';
import { MyMatchesWidgetComponent } from '../matches/components/my-matches-widget/my-matches-widget.component';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  RoleEnum = RoleEnum;
  SportEnum = SportEnum;
  public authService = inject(AuthService);
  public router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly sidenavService = inject(SidenavService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly currentUser = toSignal(this.authService.user$);
  readonly isPlayer = computed(
    () => this.currentUser()?.roles?.includes(RoleEnum.PLAYER) ?? false
  );
  readonly canSetPassword = computed(
    () => this.currentUser() !== null && !this.currentUser()?.hasPassword
  );
  readonly hasNoRoles = computed(() => !this.currentUser()?.roles?.length);

  myPlayerId = signal<string | null>(null);

  private readonly breakpointObserver = inject(BreakpointObserver);
  isSmallScreen = toSignal(
    this.breakpointObserver
      .observe('(max-width: 960px)')
      .pipe(map((result) => result.matches)),
    { initialValue: this.breakpointObserver.isMatched('(max-width: 960px)') }
  );

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
        },
        error: () => {
          /* jugador sin perfil vinculado, se queda en dashboard */
        },
      });
    }
  }
}
