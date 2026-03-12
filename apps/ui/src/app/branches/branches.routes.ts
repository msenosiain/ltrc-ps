import { Routes } from '@angular/router';
import { BranchListComponent } from './components/branch-list/branch-list.component';
import { BranchDetailComponent } from './components/branch-detail/branch-detail.component';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    component: BranchListComponent,
    data: { title: 'Ramas - Los Tordos' },
  },
  {
    path: 'detail',
    component: BranchDetailComponent,
    data: { title: 'Detalle de rama' },
  },
];
