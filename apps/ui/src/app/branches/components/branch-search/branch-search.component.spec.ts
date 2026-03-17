import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BranchSearchComponent,
  BranchSearchFilters,
} from './branch-search.component';
import { of } from 'rxjs';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';
import { categoryOptions } from '../../../common/category-options';
import { branchOptions } from '../../../common/branch-options';
import { sportOptions } from '../../../common/sport-options';

describe('BranchSearchComponent', () => {
  let component: BranchSearchComponent;
  let fixture: ComponentFixture<BranchSearchComponent>;

  const filterContextMock = {
    filterContext$: of({
      showSportFilter: true,
      sportOptions,
      forcedSport: undefined,
      showCategoryFilter: true,
      categoryOptions,
      forcedCategory: undefined,
      showBranchFilter: true,
      branchOptions,
      forcedBranch: undefined,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchSearchComponent],
      providers: [
        {
          provide: UserFilterContextService,
          useValue: filterContextMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit filtersChange on init', (done) => {
    component.filtersChange.subscribe((filters: BranchSearchFilters) => {
      expect(filters.season).toBe(component.currentYear);
      expect(filters.category).toBeUndefined();
      expect(filters.branch).toBeUndefined();
      done();
    });
    fixture.detectChanges();
  });
});
