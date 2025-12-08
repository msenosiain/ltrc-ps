import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';


export const PLAYERS_ROUTES: Routes = [
  { path: '', component: PlayersListComponent, data: { title: 'Plantel - Los Tordos' }, },
];
