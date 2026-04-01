import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BranchListComponent, BranchTab } from './branch-list.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  BranchAssignment,
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
  HockeyPositions,
} from '@ltrc-campo/shared-api-model';
import { BranchAssignmentsService } from '../../services/branch-assignments.service';
import { AuthService } from '../../../auth/auth.service';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';
import {
  categoryOptions,
} from '../../../common/category-options';
import { branchOptions } from '../../../common/branch-options';
import { sportOptions } from '../../../common/sport-options';
import { BranchSearchComponent, BranchSearchFilters } from '../branch-search/branch-search.component';

// Stub for BranchSearchComponent that does NOT emit on init
@Component({
  selector: 'ltrc-branch-search',
  standalone: true,
  template: '',
})
class BranchSearchStubComponent {
  @Input() initialFilters?: Record<string, unknown>;
  @Output() filtersChange = new EventEmitter<BranchSearchFilters>();
}

describe('BranchListComponent', () => {
  let component: BranchListComponent;
  let fixture: ComponentFixture<BranchListComponent>;

  const branchServiceMock = {
    findAll: jest.fn().mockReturnValue(of([])),
    importFromFile: jest
      .fn()
      .mockReturnValue(of({ created: 0, updated: 0, errors: [] })),
  } as Partial<BranchAssignmentsService>;

  const userSubject = new BehaviorSubject<any>(null);

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
      imports: [BranchListComponent, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        {
          provide: BranchAssignmentsService,
          useValue: branchServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: {}, paramMap: { get: () => null } },
        },
        {
          provide: AuthService,
          useValue: { user$: userSubject.asObservable() },
        },
        {
          provide: UserFilterContextService,
          useValue: filterContextMock,
        },
      ],
    })
      .overrideComponent(BranchListComponent, {
        remove: { imports: [BranchSearchComponent] },
        add: { imports: [BranchSearchStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BranchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getPlayerField', () => {
    it('should return formatted birthDate for birthDate field', () => {
      const assignment = {
        player: { birthDate: '2000-06-15T00:00:00.000Z' },
      } as unknown as BranchAssignment;

      const result = component.getPlayerField(assignment, 'birthDate');
      // es-AR locale date format
      expect(result).toBeTruthy();
      expect(result).toContain('2000');
    });

    it('should return empty string when player is null', () => {
      const assignment = { player: null } as unknown as BranchAssignment;
      expect(component.getPlayerField(assignment, 'name')).toBe('');
    });

    it('should return player field value for non-date fields', () => {
      const assignment = {
        player: { name: 'Test Player', idNumber: '12345678' },
      } as unknown as BranchAssignment;

      expect(component.getPlayerField(assignment, 'name')).toBe('Test Player');
      expect(component.getPlayerField(assignment, 'idNumber')).toBe(
        '12345678'
      );
    });
  });

  describe('getPlayerPositions', () => {
    it('should return position labels for hockey player', () => {
      const assignment = {
        player: {
          positions: [HockeyPositions.GOALKEEPER],
          sport: SportEnum.HOCKEY,
        },
      } as unknown as BranchAssignment;

      const label = component.getPlayerPositions(assignment);
      expect(label).toBeTruthy();
    });

    it('should return empty string when player has no positions', () => {
      const assignment = {
        player: { sport: SportEnum.HOCKEY },
      } as unknown as BranchAssignment;

      expect(component.getPlayerPositions(assignment)).toBe('');
    });
  });

  describe('getFilteredAssignments', () => {
    const makeBranchTab = (
      assignments: BranchAssignment[]
    ): BranchTab => ({
      label: 'Test Tab',
      branch: HockeyBranchEnum.A,
      category: CategoryEnum.CUARTA,
      assignments,
    });

    const makeAssignment = (
      name: string,
      position?: string,
      nickName?: string
    ): BranchAssignment =>
      ({
        id: name,
        player: {
          name,
          positions: position ? [position] : [],
          nickName: nickName ?? '',
          sport: SportEnum.HOCKEY,
        },
      }) as unknown as BranchAssignment;

    it('should return all assignments when no filters applied', () => {
      const tab = makeBranchTab([
        makeAssignment('Player A'),
        makeAssignment('Player B'),
      ]);

      const result = component.getFilteredAssignments(tab);
      expect(result).toHaveLength(2);
    });

    it('should filter by searchTerm on name', () => {
      const tab = makeBranchTab([
        makeAssignment('Maria Lopez'),
        makeAssignment('Ana Garcia'),
      ]);
      component.searchTerm = 'maria';

      const result = component.getFilteredAssignments(tab);
      expect(result).toHaveLength(1);
      expect((result[0].player as any).name).toBe('Maria Lopez');
    });

    it('should filter by searchTerm on nickName', () => {
      const tab = makeBranchTab([
        makeAssignment('Maria Lopez', undefined, 'Maru'),
        makeAssignment('Ana Garcia', undefined, 'Ani'),
      ]);
      component.searchTerm = 'ani';

      const result = component.getFilteredAssignments(tab);
      expect(result).toHaveLength(1);
      expect((result[0].player as any).name).toBe('Ana Garcia');
    });

    it('should filter by positionFilter', () => {
      const tab = makeBranchTab([
        makeAssignment('Player A', HockeyPositions.GOALKEEPER),
        makeAssignment('Player B', HockeyPositions.DEFENDER_LEFT),
      ]);
      component.positionFilter = HockeyPositions.GOALKEEPER;

      const result = component.getFilteredAssignments(tab);
      expect(result).toHaveLength(1);
      expect((result[0].player as any).name).toBe('Player A');
    });

    it('should combine searchTerm and positionFilter', () => {
      const tab = makeBranchTab([
        makeAssignment('Maria Lopez', HockeyPositions.GOALKEEPER),
        makeAssignment('Ana Garcia', HockeyPositions.GOALKEEPER),
        makeAssignment('Lucia Perez', HockeyPositions.DEFENDER_LEFT),
      ]);
      component.searchTerm = 'maria';
      component.positionFilter = HockeyPositions.GOALKEEPER;

      const result = component.getFilteredAssignments(tab);
      expect(result).toHaveLength(1);
      expect((result[0].player as any).name).toBe('Maria Lopez');
    });
  });
});
