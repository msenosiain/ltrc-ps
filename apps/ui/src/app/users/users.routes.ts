import { Routes } from '@angular/router';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserViewerComponent } from './components/user-viewer/user-viewer.component';
import { UserEditorComponent } from './components/user-editor/user-editor.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-ps/shared-api-model';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersListComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Usuarios', allowedRoles: [RoleEnum.ADMIN] },
  },
  {
    path: 'create',
    component: UserEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Crear usuario', allowedRoles: [RoleEnum.ADMIN] },
  },
  {
    path: ':id',
    component: UserViewerComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Detalle del usuario', allowedRoles: [RoleEnum.ADMIN] },
  },
  {
    path: ':id/edit',
    component: UserEditorComponent,
    canActivate: [hasRoleGuard],
    data: { title: 'Editar usuario', allowedRoles: [RoleEnum.ADMIN] },
  },
];
