import { Routes } from '@angular/router';
import { TripListComponent } from './components/trip-list/trip-list.component';
import { TripViewerComponent } from './components/trip-viewer/trip-viewer.component';
import { TripEditorComponent } from './components/trip-editor/trip-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

export const TRIPS_ROUTES: Routes = [
  {
    path: '',
    component: TripListComponent,
    data: { title: 'Viajes - Los Tordos' },
  },
  {
    path: 'create',
    component: TripEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Nuevo viaje', allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN] },
  },
  {
    path: ':id',
    component: TripViewerComponent,
    data: { title: 'Detalle del viaje' },
  },
  {
    path: ':id/edit',
    component: TripEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Editar viaje', allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN] },
  },
];
