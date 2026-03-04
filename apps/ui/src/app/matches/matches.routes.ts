import { Routes } from '@angular/router';
import { MatchesListComponent } from './components/matches-list/matches-list.component';
import { MatchViewerComponent } from './components/match-viewer/match-viewer.component';
import { MatchEditorComponent } from './components/match-editor/match-editor.component';
import { SquadEditorComponent } from './components/squad-editor/squad-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { Role } from '@ltrc-ps/shared-api-model';

export const MATCHES_ROUTES: Routes = [
  {
    path: '',
    component: MatchesListComponent,
    data: { title: 'Partidos - Los Tordos' },
  },
  {
    path: 'create',
    component: MatchEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Crear partido', allowedRoles: [Role.MANAGER, Role.ADMIN] },
  },
  {
    path: ':id',
    component: MatchViewerComponent,
    data: { title: 'Detalle del partido' },
  },
  {
    path: ':id/edit',
    component: MatchEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Editar partido', allowedRoles: [Role.MANAGER, Role.ADMIN] },
  },
  {
    path: ':id/squad',
    component: SquadEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Gestionar plantel', allowedRoles: [Role.COACH, Role.ADMIN] },
  },
];
