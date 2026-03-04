import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserProfileMenuComponent } from './common/components/user-profile-menu/user-profile-menu.component';

@Component({
  selector: 'ltrc-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    UserProfileMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
