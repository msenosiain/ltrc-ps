import { Routes } from '@angular/router';
import { TrainingsLayoutComponent } from './components/trainings-layout/trainings-layout.component';
import { ScheduleListComponent } from './components/schedule-list/schedule-list.component';
import { ScheduleEditorComponent } from './components/schedule-editor/schedule-editor.component';
import { ScheduleViewerComponent } from './components/schedule-viewer/schedule-viewer.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionViewerComponent } from './components/session-viewer/session-viewer.component';
import { AttendanceRollCallComponent } from './components/attendance-roll-call/attendance-roll-call.component';
import { hasRoleGuard } from '../auth/guards/has-role.guard';
import { RoleEnum } from '@ltrc-ps/shared-api-model';

export const TRAININGS_ROUTES: Routes = [
  {
    path: '',
    component: TrainingsLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'sessions',
        pathMatch: 'full',
      },
      {
        path: 'sessions',
        component: SessionListComponent,
        data: { title: 'Sesiones de entrenamiento' },
      },
      {
        path: 'schedules',
        component: ScheduleListComponent,
        canActivate: [hasRoleGuard],
        data: {
          title: 'Horarios de entrenamiento',
          allowedRoles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
        },
      },
    ],
  },
  // Detail routes outside the tab layout
  {
    path: 'schedules/create',
    component: ScheduleEditorComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Crear horario',
      allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
    },
  },
  {
    path: 'schedules/:id',
    component: ScheduleViewerComponent,
    data: { title: 'Detalle del horario' },
  },
  {
    path: 'schedules/:id/edit',
    component: ScheduleEditorComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Editar horario',
      allowedRoles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
    },
  },
  {
    path: 'sessions/:id',
    component: SessionViewerComponent,
    data: { title: 'Detalle de sesión' },
  },
  {
    path: 'sessions/:id/attendance',
    component: AttendanceRollCallComponent,
    canActivate: [hasRoleGuard],
    data: {
      title: 'Pasar lista',
      allowedRoles: [
        RoleEnum.ADMIN,
        RoleEnum.MANAGER,
        RoleEnum.COACH,
        RoleEnum.TRAINER,
      ],
    },
  },
];
