import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'players',
    loadChildren: () =>
      import('./players/players.routes').then((m) => m.PLAYERS_ROUTES),
  },
];
