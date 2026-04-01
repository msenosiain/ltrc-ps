import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AttendanceStatsWidgetComponent } from './attendance-stats-widget.component';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
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
        {
          provide: TrainingSessionsService,
          useValue: mockSessionsService,
        },
        {
          provide: UserFilterContextService,
          useValue: { filterContext$: filterContextSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceStatsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showSportFilter()', () => {
    it('should return false when filterContext has only 1 sport option', () => {
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: [{ id: SportEnum.RUGBY, label: 'Rugby' }],
          forcedSport: SportEnum.RUGBY,
          showSportFilter: false,
        })
      );
      fixture.detectChanges();

      expect(component.showSportFilter()).toBe(false);
    });

    it('should return true when filterContext has 2+ sport options', () => {
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: sportOptions, // rugby + hockey
          showSportFilter: true,
        })
      );
      fixture.detectChanges();

      expect(component.showSportFilter()).toBe(true);
    });

    it('should return false when filterContext is null', () => {
      // The component only sets filterContext from the observable; simulate empty context
      // by checking that with 0 or 1 options the computed is false
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: [],
          showSportFilter: false,
        })
      );
      fixture.detectChanges();

      expect(component.showSportFilter()).toBe(false);
    });
  });

  describe('selectedSport pre-set from forcedSport', () => {
    it('should set selectedSport to forcedSport when filterContext emits', () => {
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: [{ id: SportEnum.RUGBY, label: 'Rugby' }],
          forcedSport: SportEnum.RUGBY,
        })
      );
      fixture.detectChanges();

      expect(component.selectedSport()).toBe(SportEnum.RUGBY);
    });

    it('should leave selectedSport undefined when forcedSport is absent', () => {
      filterContextSubject.next(makeFilterContext({ forcedSport: undefined }));
      fixture.detectChanges();

      // selectedSport starts undefined and nothing overrides it
      expect(component.selectedSport()).toBeUndefined();
    });
  });

  describe('availableCategoryOptions()', () => {
    it('should return all user category options when no sport is selected', () => {
      // Start fresh with no sport forced
      filterContextSubject.next(
        makeFilterContext({
          sportOptions: sportOptions,
          forcedSport: undefined,
          categoryOptions: categoryOptions,
        })
      );
      fixture.detectChanges();
      component.selectedSport.set(undefined);

      const opts = component.availableCategoryOptions();
      // All user categories should be available (no sport filter)
      expect(opts.length).toBe(categoryOptions.length);
    });

    it('should filter category options by selectedSport when sport is set', () => {
      filterContextSubject.next(makeFilterContext({ categoryOptions: categoryOptions }));
      fixture.detectChanges();

      component.selectedSport.set(SportEnum.RUGBY);

      const opts = component.availableCategoryOptions();
      // Every returned option must be either sport-agnostic or rugby-specific
      expect(
        opts.every((c) => c.sport === null || c.sport === SportEnum.RUGBY)
      ).toBe(true);
      // Hockey-only categories must not appear
      const hockeyOnly = opts.filter((c) => c.sport === SportEnum.HOCKEY);
      expect(hockeyOnly).toHaveLength(0);
    });

    it('should filter by forcedSport when selectedSport is undefined', () => {
      filterContextSubject.next(
        makeFilterContext({
          forcedSport: SportEnum.HOCKEY,
          sportOptions: [{ id: SportEnum.HOCKEY, label: 'Hockey' }],
          categoryOptions: categoryOptions,
        })
      );
      fixture.detectChanges();

      // selectedSport is set to forcedSport by ngOnInit
      const opts = component.availableCategoryOptions();
      expect(
        opts.every((c) => c.sport === null || c.sport === SportEnum.HOCKEY)
      ).toBe(true);
    });
  });

  describe('onSportChange()', () => {
    it('should reset selectedCategory and reload stats', () => {
      component.selectedCategory.set(CategoryEnum.M19 as any);
      mockSessionsService.getAttendanceStats.mockClear();

      component.onSportChange();

      expect(component.selectedCategory()).toBeUndefined();
      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalled();
    });
  });

  describe('onCategoryChange()', () => {
    it('should reload stats without resetting sport', () => {
      component.selectedSport.set(SportEnum.RUGBY);
      mockSessionsService.getAttendanceStats.mockClear();

      component.onCategoryChange();

      expect(component.selectedSport()).toBe(SportEnum.RUGBY);
      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalled();
    });
  });

  describe('loadStats() — filter forwarding', () => {
    it('should call getAttendanceStats with selectedSport and selectedCategory', () => {
      mockSessionsService.getAttendanceStats.mockClear();

      component.selectedSport.set(SportEnum.RUGBY);
      component.selectedCategory.set(CategoryEnum.PLANTEL_SUPERIOR as any);

      component.onCategoryChange(); // triggers loadStats

      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalledWith({
        sport: SportEnum.RUGBY,
        category: CategoryEnum.PLANTEL_SUPERIOR,
      });
    });

    it('should call getAttendanceStats with undefined values when nothing is selected', () => {
      // Re-emit a context with no forced values
      filterContextSubject.next(
        makeFilterContext({ forcedSport: undefined, forcedCategory: undefined })
      );
      fixture.detectChanges();

      component.selectedSport.set(undefined);
      component.selectedCategory.set(undefined);
      mockSessionsService.getAttendanceStats.mockClear();

      component.onSportChange();

      expect(mockSessionsService.getAttendanceStats).toHaveBeenCalledWith({
        sport: undefined,
        category: undefined,
      });
    });

    it('should use forcedSport from context when selectedSport is undefined', () => {
      filterContextSubject.next(
        makeFilterContext({
          forcedSport: SportEnum.HOCKEY,
          sportOptions: [{ id: SportEnum.HOCKEY, label: 'Hockey' }],
        })
      );
      fixture.detectChanges();
      // After context emission, selectedSport should have been set to HOCKEY by ngOnInit
      mockSessionsService.getAttendanceStats.mockClear();

      component.onCategoryChange();

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
