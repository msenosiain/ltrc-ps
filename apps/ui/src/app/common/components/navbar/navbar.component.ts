import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ltrc-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterModule, MatButtonModule, MatToolbarModule],
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {

  // TODO get menu items from DB
  menuItems = [
    { id: 1, label: 'Plantel', path: '/players' },
    { id: 2, label: 'Partidos', path: '/matches' },
    { id: 3, label: 'Calendario', path: '/calendar' },
  ];
}
