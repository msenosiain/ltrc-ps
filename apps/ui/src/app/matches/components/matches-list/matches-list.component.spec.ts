import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchesListComponent } from './matches-list.component';
import { RouterModule } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';
import { of } from 'rxjs';
import { MatchStatusEnum } from '@ltrc-campo/shared-api-model';

describe('MatchesListComponent', () => {
  let component: MatchesListComponent;
  let fixture: ComponentFixture<MatchesListComponent>;

  const matchesServiceMock = {
    getMatches: jest
      .fn()
      .mockReturnValue(of({ total: 0, items: [], page: 1, size: 10 })),
    getStatusLabel: jest.fn().mockReturnValue('Estado'),
    getTypeLabel: jest.fn().mockReturnValue('Tipo'),
  } as Partial<MatchesService>;

  const tournamentsServiceMock = {
    getTournaments: jest.fn().mockReturnValue(of([])),
  } as Partial<TournamentsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesListComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MatchesService, useValue: matchesServiceMock },
        { provide: TournamentsService, useValue: tournamentsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesListComponent);
    component = fixture.componentInstance;

    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      page: { subscribe: () => ({ unsubscribe: () => {} }) },
    } as any;
    component.sort = {
      active: '',
      direction: '',
      sortChange: { subscribe: () => ({ unsubscribe: () => {} }) },
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getResultLabel should return em dash when no result', () => {
    const match = { result: undefined, isHome: true } as any;
    expect(component.getResultLabel(match)).toBe('—');
  });

  it('getResultLabel should show result from home perspective', () => {
    const match = {
      result: { homeScore: 2, awayScore: 1 },
      isHome: true,
    } as any;
    expect(component.getResultLabel(match)).toBe('2 - 1');
  });

  it('getResultLabel should invert result when away', () => {
    const match = {
      result: { homeScore: 2, awayScore: 1 },
      isHome: false,
    } as any;
    expect(component.getResultLabel(match)).toBe('1 - 2');
  });

  it('isCompleted should return true only for completed status', () => {
    expect(component.isCompleted(MatchStatusEnum.COMPLETED)).toBe(true);
    expect(component.isCompleted(MatchStatusEnum.UPCOMING)).toBe(false);
  });
});
