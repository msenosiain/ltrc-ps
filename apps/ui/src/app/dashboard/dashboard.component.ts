import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
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

@Component({
  selector: 'ltrc-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, AllowedRolesDirective, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  Role = Role;
  public authService = inject(AuthService);
  public router = inject(Router);

  isSmallScreen = toSignal(
    inject(BreakpointObserver).observe('(max-width: 960px)').pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
