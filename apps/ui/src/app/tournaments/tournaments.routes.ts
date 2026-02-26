import { Routes } from '@angular/router';
import { TournamentsListComponent } from './components/tournaments-list/tournaments-list.component';
import { TournamentViewerComponent } from './components/tournament-viewer/tournament-viewer.component';
import { TournamentEditorComponent } from './components/tournament-editor/tournament-editor.component';

export const TOURNAMENTS_ROUTES: Routes = [
  {
    path: '',
    component: TournamentsListComponent,
    data: { title: 'Torneos - Los Tordos' },
  },
  {
    path: 'create',
    component: TournamentEditorComponent,
    data: { title: 'Crear torneo' },
  },
  {
    path: ':id',
    component: TournamentViewerComponent,
    data: { title: 'Detalle del torneo' },
  },
  {
    path: ':id/edit',
    component: TournamentEditorComponent,
    data: { title: 'Editar torneo' },
  },
];