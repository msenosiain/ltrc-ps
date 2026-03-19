import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripListComponent } from './trip-list.component';
import { TripsService } from '../../services/trips.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { API_CONFIG_TOKEN } from '../../../app.config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TripStatusEnum } from '@ltrc-campo/shared-api-model';

const mockTripsService = {
  getTrips: jest.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 10 })),
};

describe('TripListComponent', () => {
  let component: TripListComponent;
  let fixture: ComponentFixture<TripListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripListComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TripsService, useValue: mockTripsService },
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: 'http://localhost:3000/api/v1' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TripListComponent);
    component = fixture.componentInstance;

    jest.spyOn(component, 'ngAfterViewInit').mockImplementation(() => {
      (component as any).dataSource.setFilters({});
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getStatusLabel() should return correct label', () => {
    expect(component.getStatusLabel(TripStatusEnum.OPEN)).toBe('Abierto');
    expect(component.getStatusLabel(TripStatusEnum.DRAFT)).toBe('Borrador');
  });
});
