import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AttendanceStatsWidgetComponent } from './attendance-stats-widget.component';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { MatDialog } from '@angular/material/dialog';
import { SportEnum, CategoryEnum } from '@ltrc-campo/shared-api-model';
import { sportOptions } from '../../../common/sport-options';
import { categoryOptions } from '../../../common/category-options';

const mockStats = { byCategory: {} };

const makeFilterContext = (overrides: Partial<FilterContext> = {}): FilterContext => ({
  showSportFilter: true,
  sportOptions: sportOptions,
  forcedSport: undefined,
  showCategoryFilter: true,
  categoryOptions: categoryOptions,
  forcedCategory: undefined,
  showBranchFilter: false,
  branchOptions: [],
  forcedBranch: undefined,
  ...overrides,
});

describe('AttendanceStatsWidgetComponent', () => {
  let component: AttendanceStatsWidgetComponent;
  let fixture: ComponentFixture<AttendanceStatsWidgetComponent>;
  let filterContextSubject: BehaviorSubject<FilterContext>;
  let mockSessionsService: { getAttendanceStats: jest.Mock };

  beforeEach(async () => {
    filterContextSubject = new BehaviorSubject<FilterContext>(makeFilterContext());

    mockSessionsService = {
      getAttendanceStats: jest.fn().mockReturnValue(of(mockStats)),
    };

    await TestBed.configureTestingModule({
      imports: [AttendanceStatsWidgetComponent, NoopAnimationsModule],
      providers: [
        { provide: TrainingSessionsService, useValue: mockSessionsService },
        { provide: UserFilterContextService, useValue: { filterContext$: filterContextSubject.asObservable() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceStatsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showFilterButton', () => {
    it('should return false when filterContext has only 1 sport option', () => {
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: [{ id: SportEnum.RUGBY, label: 'Rugby' }],
          forcedSport: SportEnum.RUGBY,
          categoryOptions: [categoryOptions[0]],
        })
      );
      fixture.detectChanges();

      expect(component.showFilterButton).toBe(false);
    });

    it('should return true when filterContext has 2+ sport options', () => {
      filterContextSubject.next(makeFilterContext({ sportOptions: sportOptions }));
      fixture.detectChanges();

      expect(component.showFilterButton).toBe(true);
    });

    it('should return false when filterContext is null', () => {
      filterContextSubject.next(
        makeFilterContext({ sportOptions: [], categoryOptions: [] })
      );
      fixture.detectChanges();

      expect(component.showFilterButton).toBe(false);
    });
  });

  describe('hasFilters', () => {
    it('should return false when nothing is selected', () => {
      expect(component.hasFilters).toBe(false);
    });

    it('should return true when sport is selected', () => {
      component.selected = { sport: SportEnum.RUGBY };
      expect(component.hasFilters).toBe(true);
    });

    it('should return true when category is selected', () => {
      component.selected = { category: CategoryEnum.M19 as any };
      expect(component.hasFilters).toBe(true);
    });
  });

  describe('selected pre-set from forcedSport / forcedCategory', () => {
    it('should set selected.sport to forcedSport when filterContext emits', () => {
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: [{ id: SportEnum.RUGBY, label: 'Rugby' }],
          forcedSport: SportEnum.RUGBY,
        })
      );
      fixture.detectChanges();

      expect(component.selected.sport).toBe(SportEnum.RUGBY);
    });

    it('should leave selected.sport undefined when forcedSport is absent', () => {
      filterContextSubject.next(makeFilterContext({ forcedSport: undefined }));
      fixture.detectChanges();

      expect(component.selected.sport).toBeUndefined();
    });
  });

  describe('loadStats() — filter forwarding', () => {
    it('should call getAttendanceStats with selected sport and category', () => {
      mockSessionsService.getAttendanceStats.mockClear();

      component.selected = { sport: SportEnum.RUGBY, category: CategoryEnum.PLANTEL_SUPERIOR as any };
      filterContextSubject.next(makeFilterContext());
      fixture.detectChanges();

      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalledWith(
        expect.objectContaining({ sport: SportEnum.RUGBY, category: CategoryEnum.PLANTEL_SUPERIOR })
      );
    });

    it('should use forcedSport from context when it is set', () => {
      mockSessionsService.getAttendanceStats.mockClear();

      filterContextSubject.next(
        makeFilterContext({
          forcedSport: SportEnum.HOCKEY,
          sportOptions: [{ id: SportEnum.HOCKEY, label: 'Hockey' }],
        })
      );
      fixture.detectChanges();

      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalledWith(
        expect.objectContaining({ sport: SportEnum.HOCKEY })
      );
    });
  });

  describe('getPctClass()', () => {
    it('should return pct-high for >= 70', () => {
      expect(component.getPctClass(70)).toBe('pct-high');
      expect(component.getPctClass(100)).toBe('pct-high');
    });

    it('should return pct-mid for 40-69', () => {
      expect(component.getPctClass(40)).toBe('pct-mid');
      expect(component.getPctClass(69)).toBe('pct-mid');
    });

    it('should return pct-low for < 40', () => {
      expect(component.getPctClass(0)).toBe('pct-low');
      expect(component.getPctClass(39)).toBe('pct-low');
    });
  });
});
