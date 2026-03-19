import { Routes } from '@angular/router';
import { TournamentsListComponent } from './components/tournaments-list/tournaments-list.component';
import { TournamentViewerComponent } from './components/tournament-viewer/tournament-viewer.component';
import { TournamentEditorComponent } from './components/tournament-editor/tournament-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

export const TOURNAMENTS_ROUTES: Routes = [
  {
    path: '',
    component: TournamentsListComponent,
    data: { title: 'Torneos - Los Tordos' },
  },
  {
    path: 'create',
    component: TournamentEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Crear torneo', allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN] },
  },
  {
    path: ':id',
    component: TournamentViewerComponent,
    data: { title: 'Detalle del torneo' },
  },
  {
    path: ':id/edit',
    component: TournamentEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Editar torneo', allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN] },
  },
];
