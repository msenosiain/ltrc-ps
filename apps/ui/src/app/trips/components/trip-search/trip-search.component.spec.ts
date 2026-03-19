import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripSearchComponent } from './trip-search.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TripSearchComponent', () => {
  let component: TripSearchComponent;
  let fixture: ComponentFixture<TripSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripSearchComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TripSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filters on searchTerm change', (done) => {
    component.filtersChange.subscribe((filters) => {
      if (filters.searchTerm === 'Córdoba') {
        expect(filters.searchTerm).toBe('Córdoba');
        done();
      }
    });
    component.searchForm.get('searchTerm')?.setValue('Córdoba');
  });
});
