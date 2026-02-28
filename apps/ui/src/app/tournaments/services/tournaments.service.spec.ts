import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TournamentsService } from './tournaments.service';
import { API_CONFIG_TOKEN } from '../../app.config';

const API_BASE = 'http://localhost:3000/api/v1';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TournamentsService,
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: API_BASE } },
      ],
    });

    service = TestBed.inject(TournamentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTournaments should GET /tournaments without params', () => {
    const mockTournaments = [{ id: '1', name: 'Copa 2024' }];
    service.getTournaments().subscribe((res) => expect(res).toEqual(mockTournaments));

    const req = httpMock.expectOne(`${API_BASE}/tournaments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTournaments);
  });

  it('getTournaments should pass searchTerm as query param', () => {
    service.getTournaments('copa').subscribe();

    const req = httpMock.expectOne(`${API_BASE}/tournaments?searchTerm=copa`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTournamentById should GET /tournaments/:id', () => {
    const mockTournament = { id: '1', name: 'Copa 2024' };
    service.getTournamentById('1').subscribe((res) => expect(res).toEqual(mockTournament));

    const req = httpMock.expectOne(`${API_BASE}/tournaments/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTournament);
  });

  it('createTournament should POST /tournaments', () => {
    const dto = { name: 'Copa 2024', season: '2024' };
    const mockResponse = { id: '1', ...dto };

    service.createTournament(dto).subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(`${API_BASE}/tournaments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('updateTournament should PATCH /tournaments/:id', () => {
    const dto = { name: 'Copa 2025' };
    const mockResponse = { id: '1', name: 'Copa 2025' };

    service.updateTournament('1', dto).subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(`${API_BASE}/tournaments/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mockResponse);
  });

  it('deleteTournament should DELETE /tournaments/:id', () => {
    service.deleteTournament('1').subscribe();

    const req = httpMock.expectOne(`${API_BASE}/tournaments/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});