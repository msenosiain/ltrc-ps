import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PlayerDetailComponent } from './components/player-detail/player-detail.component';
import { PlayerEditComponent } from './components/player-edit/player-edit.component';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersListComponent,
    data: { title: 'Plantel - Los Tordos' },
  },
  {
    path: ':id',
    component: PlayerDetailComponent,
    data: { title: 'Detalle del jugador' },
  },
  {
    path: ':id/edit',
    component: PlayerEditComponent,
    data: { title: 'Editar jugador' },
  },
];
