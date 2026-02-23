import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PlayerDetailComponent } from './components/player-detail/player-detail.component';
import { PlayerCreateComponent } from './components/player-create/player-create.component';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersListComponent,
    data: { title: 'Plantel - Los Tordos' },
  },
  {
    path: 'create',
    component: PlayerCreateComponent,
    data: { title: 'Crear jugador' },
  },
  {
    path: ':id',
    component: PlayerDetailComponent,
    data: { title: 'Detalle del jugador' },
  },

];
