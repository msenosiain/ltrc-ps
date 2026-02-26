import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentsListComponent } from './tournaments-list.component';
import { RouterModule } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import { of } from 'rxjs';
import { Tournament } from '@ltrc-ps/shared-api-model';

const mockTournaments: Partial<Tournament>[] = [
  { id: '1', name: 'Copa Verano', season: '2022', description: 'Torneo verano' },
  { id: '2', name: 'Copa Invierno', season: '2024', description: 'Torneo invierno' },
  { id: '3', name: 'Liga Apertura', season: '2023', description: '' },
  { id: '4', name: 'Torneo Amistoso', season: undefined, description: 'Sin temporada' },
];

describe('TournamentsListComponent', () => {
  let component: TournamentsListComponent;
  let fixture: ComponentFixture<TournamentsListComponent>;

  const tournamentsServiceMock = {
    getTournaments: jest.fn().mockReturnValue(of(mockTournaments)),
  } as Partial<TournamentsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentsListComponent, RouterModule.forRoot([])],
      providers: [
        { provide: TournamentsService, useValue: tournamentsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and sort by season descending on init', () => {
    const seasons = component.tournaments.map((t) => t.season);
    expect(seasons).toEqual(['2024', '2023', '2022', undefined]);
  });

  it('should filter by name', () => {
    component.applyFilters({ searchTerm: 'copa' });
    expect(component.tournaments.length).toBe(2);
    expect(component.tournaments.every((t) => t.name.toLowerCase().includes('copa'))).toBe(true);
  });

  it('should filter by season', () => {
    component.applyFilters({ searchTerm: '2023' });
    expect(component.tournaments.length).toBe(1);
    expect(component.tournaments[0].name).toBe('Liga Apertura');
  });

  it('should filter by description', () => {
    component.applyFilters({ searchTerm: 'invierno' });
    expect(component.tournaments.length).toBe(1);
    expect(component.tournaments[0].name).toBe('Copa Invierno');
  });

  it('should show all when searchTerm is cleared', () => {
    component.applyFilters({ searchTerm: 'copa' });
    component.applyFilters({ searchTerm: '' });
    expect(component.tournaments.length).toBe(4);
  });

  it('should put tournaments without season at the end', () => {
    const last = component.tournaments[component.tournaments.length - 1];
    expect(last.season).toBeUndefined();
  });
});