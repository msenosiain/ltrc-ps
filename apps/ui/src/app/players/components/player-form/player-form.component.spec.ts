import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerFormComponent } from './player-form.component';
import { PlayersService } from '../../services/players.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

describe('PlayerFormComponent', () => {
  let component: PlayerFormComponent;
  let fixture: ComponentFixture<PlayerFormComponent>;

  const playersServiceMock = {
    getPlayerPhotoUrl: jest.fn().mockReturnValue(''),
    getFieldOptions: jest.fn().mockReturnValue(of({ healthInsurances: [] })),
  } as Partial<PlayersService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerFormComponent],
      providers: [
        { provide: PlayersService, useValue: playersServiceMock },
        provideNativeDateAdapter(),
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
