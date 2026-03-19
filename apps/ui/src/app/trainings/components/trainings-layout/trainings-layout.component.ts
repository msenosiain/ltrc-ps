import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleEnum } from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';

@Component({
  selector: 'ltrc-trainings-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTabsModule,
    AllowedRolesDirective,
  ],
  templateUrl: './trainings-layout.component.html',
  styleUrl: './trainings-layout.component.scss',
})
export class TrainingsLayoutComponent {
  readonly RoleEnum = RoleEnum;
}