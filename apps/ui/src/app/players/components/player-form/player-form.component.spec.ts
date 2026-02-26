import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerFormComponent } from './player-form.component';
import { PlayersService } from '../../services/players.service';

describe('PlayerFormComponent', () => {
  let component: PlayerFormComponent;
  let fixture: ComponentFixture<PlayerFormComponent>;

  const playersServiceMock = {
    getPlayerPhotoUrl: jest.fn().mockReturnValue(''),
  } as Partial<PlayersService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerFormComponent],
      providers: [
        { provide: PlayersService, useValue: playersServiceMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlayerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
