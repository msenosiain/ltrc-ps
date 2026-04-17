import { Routes } from '@angular/router';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payments-report/payments-report.component').then(
        (m) => m.PaymentsReportComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COORDINATOR] },
  },
];
