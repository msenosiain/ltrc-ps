import { Routes } from '@angular/router';
import { MatchesListComponent } from './components/matches-list/matches-list.component';
import { MatchViewerComponent } from './components/match-viewer/match-viewer.component';
import { MatchEditorComponent } from './components/match-editor/match-editor.component';
import { SquadEditorComponent } from './components/squad-editor/squad-editor.component';

export const MATCHES_ROUTES: Routes = [
  {
    path: '',
    component: MatchesListComponent,
    data: { title: 'Partidos - Los Tordos' },
  },
  {
    path: 'create',
    component: MatchEditorComponent,
    data: { title: 'Crear partido' },
  },
  {
    path: ':id',
    component: MatchViewerComponent,
    data: { title: 'Detalle del partido' },
  },
  {
    path: ':id/edit',
    component: MatchEditorComponent,
    data: { title: 'Editar partido' },
  },
  {
    path: ':id/squad',
    component: SquadEditorComponent,
    data: { title: 'Gestionar plantel' },
  },
];
