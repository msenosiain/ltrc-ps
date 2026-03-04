import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PlayerViewerComponent } from './components/player-viewer/player-viewer.component';
import { PlayerEditorComponent } from './components/player-editor/player-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { Role } from '@ltrc-ps/shared-api-model';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersListComponent,
    data: { title: 'Plantel - Los Tordos' },
  },
  {
    path: 'create',
    component: PlayerEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Crear jugador', allowedRoles: [Role.MANAGER, Role.ADMIN] },
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
    data: { title: 'Editar jugador', allowedRoles: [Role.MANAGER, Role.ADMIN] },
  },
];
