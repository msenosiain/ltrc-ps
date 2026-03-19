import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchFormComponent } from './match-form.component';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';
import { MatchesService } from '../../services/matches.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';
import { MatchStatusEnum } from '@ltrc-ps/shared-api-model';

describe('MatchFormComponent', () => {
  let component: MatchFormComponent;
  let fixture: ComponentFixture<MatchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchFormComponent],
      providers: [
        provideNativeDateAdapter(),
        {
          provide: TournamentsService,
          useValue: {
            getTournaments: jest
              .fn()
              .mockReturnValue(of({ items: [], total: 0, page: 1, size: 1000 })),
          },
        },
        {
          provide: MatchesService,
          useValue: {
            getFieldOptions: jest
              .fn()
              .mockReturnValue(
                of({ opponents: [], venues: [], divisions: [] })
              ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require date, opponent and venue', () => {
    expect(component.matchForm.valid).toBeFalsy();
    component.matchForm.patchValue({
      date: new Date(),
      opponent: 'River',
      venue: 'El Monumental',
    });
    expect(component.matchForm.valid).toBeTruthy();
  });

  it('should not emit when form is invalid', () => {
    const spy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit formSubmit when form is valid', () => {
    const spy = jest.spyOn(component.formSubmit, 'emit');
    component.matchForm.patchValue({
      date: new Date(),
      opponent: 'River',
      venue: 'El Monumental',
      status: MatchStatusEnum.UPCOMING,
      isHome: true,
    });
    component.timeControl.setValue(new Date(2000, 0, 1, 15, 0));
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancel', () => {
    const spy = jest.spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});
