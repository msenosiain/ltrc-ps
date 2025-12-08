import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './common/components/navbar/navbar.component';

@Component({
  imports: [RouterModule, NavbarComponent],
  selector: 'ltrc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ui';
}
