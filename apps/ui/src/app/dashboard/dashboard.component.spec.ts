import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PlayersService } from '../players/services/players.service';
import { AuthService } from '../auth/auth.service';
import { SidenavService } from '../common/services/sidenav.service';

const mockPlayersService = {
  getMyPlayer: jest.fn().mockReturnValue(of(null)),
};

const mockAuthService = {
  user$: of(null),
};

const mockSidenavService = {
  toggle$: of(),
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: PlayersService, useValue: mockPlayersService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SidenavService, useValue: mockSidenavService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
