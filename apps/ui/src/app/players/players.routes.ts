import { Routes } from '@angular/router';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { PlayerViewerComponent } from './components/player-viewer/player-viewer.component';
import { PlayerEditorComponent } from './components/player-editor/player-editor.component';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    component: PlayersListComponent,
    data: { title: 'Plantel - Los Tordos' },
  },
  {
    path: 'create',
    component: PlayerEditorComponent,
    data: { title: 'Crear jugador' },
  },
  {
    path: ':id',
    component: PlayerViewerComponent,
    data: { title: 'Detalle del jugador' },
    children: [
      {
        path: 'edit',
        component: PlayerEditorComponent,
        data: { title: 'Editar jugador' },
      },
    ],
  },
];
