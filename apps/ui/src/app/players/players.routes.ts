import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PlayerViewerComponent } from './components/player-viewer/player-viewer.component';
import { PlayerEditorComponent } from './components/player-editor/player-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { Role } from '../auth/roles.enum';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersListComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Plantel - Los Tordos',
      allowedRoles: [Role.USER, Role.ADMIN],
    },
  },
  {
    path: 'create',
    component: PlayerEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Crear jugador', allowedRoles: [Role.USER, Role.ADMIN] },
  },
  {
    path: ':id',
    component: PlayerViewerComponent,
    data: { title: 'Detalle del jugador' },
  },
  {
    path: ':id/edit',
    component: PlayerEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Editar jugador', allowedRoles: [Role.USER, Role.ADMIN] },
  },
];
