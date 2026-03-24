import { Routes } from '@angular/router';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

export const PHYSICAL_TRAINING_ROUTES: Routes = [
  { path: '', redirectTo: 'routines', pathMatch: 'full' },
  {
    path: 'exercises',
    loadComponent: () =>
      import('./components/exercise-list/exercise-list.component').then(
        (m) => m.ExerciseListComponent
      ),
  },
  {
    path: 'exercises/new',
    loadComponent: () =>
      import('./components/exercise-form/exercise-form.component').then(
        (m) => m.ExerciseFormComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER] },
  },
  {
    path: 'exercises/:id/edit',
    loadComponent: () =>
      import('./components/exercise-form/exercise-form.component').then(
        (m) => m.ExerciseFormComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER] },
  },
  {
    path: 'exercises/:id',
    loadComponent: () =>
      import('./components/exercise-viewer/exercise-viewer.component').then(
        (m) => m.ExerciseViewerComponent
      ),
  },
  {
    path: 'routines',
    loadComponent: () =>
      import('./components/routine-list/routine-list.component').then(
        (m) => m.RoutineListComponent
      ),
  },
  {
    path: 'routines/new',
    loadComponent: () =>
      import('./components/routine-form/routine-form.component').then(
        (m) => m.RoutineFormComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER] },
  },
  {
    path: 'routines/:id/edit',
    loadComponent: () =>
      import('./components/routine-form/routine-form.component').then(
        (m) => m.RoutineFormComponent
      ),
    canActivate: [hasRoleGuard],
    data: { allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.TRAINER] },
  },
  {
    path: 'routines/:id',
    loadComponent: () =>
      import('./components/routine-viewer/routine-viewer.component').then(
        (m) => m.RoutineViewerComponent
      ),
  },
];
