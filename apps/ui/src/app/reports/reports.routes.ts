import { Routes } from '@angular/router';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

const REPORTS_ROLES = [RoleEnum.ADMIN, RoleEnum.COORDINATOR];

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'encounter',
    pathMatch: 'full',
  },
  {
    path: 'encounter',
    loadComponent: () =>
      import('./pages/encounter-report/encounter-report.component').then(
        (m) => m.EncounterReportComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: REPORTS_ROLES },
  },
];
