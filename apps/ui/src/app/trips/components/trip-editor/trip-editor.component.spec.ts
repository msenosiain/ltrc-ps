import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripEditorComponent } from './trip-editor.component';
import { TripsService } from '../../services/trips.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { API_CONFIG_TOKEN } from '../../../app.config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const mockTripsService = {
  getTripById: jest.fn(),
  createTrip: jest.fn().mockReturnValue(of({ id: 'new-id' })),
  updateTrip: jest.fn().mockReturnValue(of({})),
  deleteTrip: jest.fn().mockReturnValue(of(undefined)),
};

describe('TripEditorComponent', () => {
  let component: TripEditorComponent;
  let fixture: ComponentFixture<TripEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripEditorComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: TripsService, useValue: mockTripsService },
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: 'http://localhost:3000/api/v1' } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode when no id', () => {
    expect(component.editing).toBe(false);
  });
});
