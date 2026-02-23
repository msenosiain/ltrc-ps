import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthCallbackComponent } from './auth/components/auth-callback/auth-callback.component';
import { authGuard } from './auth/guards/auth.guard';

import { hasRoleGuard } from './auth/guards/has-role.guard';
import { Role } from './auth/roles.enum';
import { LoginComponent } from './auth/components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: { allowedRoles: [Role.USER, Role.ADMIN] },
    children: [
      {
        path: 'players',
        loadChildren: () =>
          import('./players/players.routes').then((m) => m.PLAYERS_ROUTES),
      },
    ],
  },
  // Fallback to dashboard for any unknown route
  { path: '**', redirectTo: '/dashboard' },
];
