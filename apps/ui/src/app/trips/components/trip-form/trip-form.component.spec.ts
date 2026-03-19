import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripFormComponent } from './trip-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripFormComponent, NoopAnimationsModule],
      providers: [provideNativeDateAdapter()],
    }).compileComponents();

    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('form should be valid with required fields', () => {
    component.form.patchValue({
      name: 'Gira Córdoba',
      destination: 'Córdoba',
      departureDate: new Date('2026-07-10'),
      costPerPerson: 5000,
    });
    expect(component.form.valid).toBe(true);
  });

  it('should emit formSubmit when valid', () => {
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    component.form.patchValue({
      name: 'Gira Córdoba',
      destination: 'Córdoba',
      departureDate: new Date('2026-07-10'),
      costPerPerson: 5000,
    });
    component.onSubmit();
    expect(emitSpy).toHaveBeenCalled();
  });
});
