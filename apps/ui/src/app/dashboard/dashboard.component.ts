import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal, computed} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {Router, RouterModule} from "@angular/router";
import {Role} from '../auth/roles.enum';
import {AllowedRolesDirective} from '../auth/directives/allowed-roles.directive';
import {AuthService} from '../auth/auth.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {PlayersService} from '../players/services/players.service';

@Component({
  selector: 'ltrc-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, AllowedRolesDirective, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  Role = Role;
  public authService = inject(AuthService);
  public router = inject(Router);
  private readonly playersService = inject(PlayersService);

  private readonly currentUser = toSignal(this.authService.user$);
  readonly isPlayer = computed(() =>
    this.currentUser()?.roles?.includes(Role.PLAYER) ?? false
  );

  myPlayerId = signal<string | null>(null);

  private readonly breakpointObserver = inject(BreakpointObserver);
  isSmallScreen = toSignal(
    this.breakpointObserver.observe('(max-width: 960px)').pipe(
      map(result => result.matches)
    ),
    { initialValue: this.breakpointObserver.isMatched('(max-width: 960px)') }
  );

  ngOnInit(): void {
    if (this.isPlayer()) {
      this.playersService.getMyPlayer().subscribe({
        next: (player) => {
          this.myPlayerId.set(player.id ?? null);
          if (this.router.url === '/dashboard') {
            this.router.navigate(['/dashboard/players', player.id]);
          }
        },
        error: () => { /* jugador sin perfil vinculado, se queda en dashboard */ },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
