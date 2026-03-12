import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthCallbackComponent } from './auth/components/auth-callback/auth-callback.component';
import { authGuard } from './auth/guards/auth.guard';

import { LoginComponent } from './auth/components/login/login.component';
import { ActivateAccountComponent } from './auth/components/activate-account/activate-account.component';
import { SetPasswordComponent } from './auth/components/set-password/set-password.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'auth/activate', component: ActivateAccountComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'players',
        loadChildren: () =>
          import('./players/players.routes').then((m) => m.PLAYERS_ROUTES),
      },
      {
        path: 'tournaments',
        loadChildren: () =>
          import('./tournaments/tournaments.routes').then(
            (m) => m.TOURNAMENTS_ROUTES
          ),
      },
      {
        path: 'matches',
        loadChildren: () =>
          import('./matches/matches.routes').then((m) => m.MATCHES_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'branches',
        loadChildren: () =>
          import('./branches/branches.routes').then(
            (m) => m.BRANCHES_ROUTES
          ),
      },
      { path: 'set-password', component: SetPasswordComponent },
    ],
  },
  // Fallback to dashboard for any unknown route
  { path: '**', redirectTo: '/dashboard' },
];
