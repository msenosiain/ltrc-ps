import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentFormComponent } from './tournament-form.component';

describe('TournamentFormComponent', () => {
  let component: TournamentFormComponent;
  let fixture: ComponentFixture<TournamentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have name as required field', () => {
    const nameControl = component.tournamentForm.get('name');
    expect(nameControl?.valid).toBeFalsy();
    nameControl?.setValue('Copa 2024');
    expect(nameControl?.valid).toBeTruthy();
  });

  it('should patch form when tournament input changes', () => {
    component.tournament = { name: 'Copa 2024', season: '2024' } as any;
    component.ngOnChanges({ tournament: {} as any });
    expect(component.tournamentForm.get('name')?.value).toBe('Copa 2024');
    expect(component.tournamentForm.get('season')?.value).toBe('2024');
  });

  it('should not emit when form is invalid', () => {
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit formSubmit when form is valid', () => {
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.tournamentForm.setValue({
      name: 'Copa 2024',
      season: '2024',
      description: '',
      sport: null,
      categories: [],
    });
    component.onSubmit();
    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Copa 2024',
      season: '2024',
      description: '',
      sport: null,
      categories: [],
    });
  });

  it('should emit cancel', () => {
    const emitSpy = jest.spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(emitSpy).toHaveBeenCalled();
  });
});
