import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { of } from 'rxjs';

describe('PlayersList', () => {
  let component: PlayersListComponent;
  let fixture: ComponentFixture<PlayersListComponent>;

  const playersServiceMock = {
    getPositionLabel: jest.fn().mockReturnValue('Position'),
    getPlayerPhotoUrl: jest.fn().mockReturnValue(''),
    getPlayers: jest.fn().mockReturnValue(of({ total: 0, items: [] })),
  } as Partial<PlayersService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersListComponent, RouterModule.forRoot([])],
      providers: [
        { provide: PlayersService, useValue: playersServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: {}, paramMap: { get: () => null } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersListComponent);
    component = fixture.componentInstance;

    // Stubs mínimos para evitar errores en ngAfterViewInit (sort & paginator)
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      page: { subscribe: () => ({ unsubscribe: () => {} }) },
    } as any;
    component.sort = {
      active: '',
      direction: '',
      sortChange: { subscribe: () => ({ unsubscribe: () => {} }) },
    } as any;

    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
