import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripViewerComponent } from './trip-viewer.component';
import { TripsService } from '../../services/trips.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { API_CONFIG_TOKEN } from '../../../app.config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import {
  TripStatusEnum,
  TripParticipantStatusEnum,
  TripParticipantTypeEnum,
} from '@ltrc-ps/shared-api-model';

const mockTripsService = {
  getTripById: jest.fn(),
  addParticipant: jest.fn(),
  updateParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  recordPayment: jest.fn(),
  removePayment: jest.fn(),
};

describe('TripViewerComponent', () => {
  let component: TripViewerComponent;
  let fixture: ComponentFixture<TripViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripViewerComponent, NoopAnimationsModule],
      providers: [
        provideNativeDateAdapter(),
        provideHttpClient(),
        provideRouter([]),
        { provide: TripsService, useValue: mockTripsService },
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: 'http://localhost:3000/api/v1' } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getTotalPaid() should sum all payments', () => {
    const p: any = {
      id: 'p1',
      type: TripParticipantTypeEnum.PLAYER,
      status: TripParticipantStatusEnum.CONFIRMED,
      costAssigned: 5000,
      payments: [{ amount: 2000 }, { amount: 1500 }],
    };
    expect(component.getTotalPaid(p)).toBe(3500);
  });

  it('getBalance() should return costAssigned - totalPaid', () => {
    const p: any = {
      id: 'p1',
      type: TripParticipantTypeEnum.PLAYER,
      status: TripParticipantStatusEnum.CONFIRMED,
      costAssigned: 5000,
      payments: [{ amount: 2000 }],
    };
    expect(component.getBalance(p)).toBe(3000);
  });
});
