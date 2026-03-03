import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentsListComponent } from './tournaments-list.component';
import { RouterModule } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import { of } from 'rxjs';
import { Tournament } from '@ltrc-ps/shared-api-model';

const mockTournaments: Partial<Tournament>[] = [
  { id: '1', name: 'Copa Invierno', season: '2024' },
  { id: '2', name: 'Liga Apertura', season: '2023' },
];

describe('TournamentsListComponent', () => {
  let component: TournamentsListComponent;
  let fixture: ComponentFixture<TournamentsListComponent>;
  let getTournamentsSpy: jest.Mock;

  beforeEach(async () => {
    getTournamentsSpy = jest.fn().mockReturnValue(of(mockTournaments));

    await TestBed.configureTestingModule({
      imports: [TournamentsListComponent, RouterModule.forRoot([])],
      providers: [
        { provide: TournamentsService, useValue: { getTournaments: getTournamentsSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentsListComponent);
    component = fixture.componentInstance;

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

  it('should load tournaments on init with default sort by season desc', () => {
    expect(getTournamentsSpy).toHaveBeenCalledWith(undefined, undefined, 'season', 'desc');
    expect(component.tournaments).toEqual(mockTournaments);
  });

  it('should call getTournaments with searchTerm when filters change', () => {
    component.applyFilters({ searchTerm: 'copa' });
    expect(getTournamentsSpy).toHaveBeenCalledWith('copa', undefined, 'season', 'desc');
  });

  it('should call getTournaments without searchTerm when cleared', () => {
    component.applyFilters({ searchTerm: undefined });
    expect(getTournamentsSpy).toHaveBeenCalledWith(undefined, undefined, 'season', 'desc');
  });
});