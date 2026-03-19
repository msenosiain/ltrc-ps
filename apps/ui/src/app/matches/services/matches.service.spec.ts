import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatchesService } from './matches.service';
import { API_CONFIG_TOKEN } from '../../app.config';
import { MatchStatusEnum } from '@ltrc-campo/shared-api-model';

const API_BASE = 'http://localhost:3000/api/v1';

describe('MatchesService', () => {
  let service: MatchesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MatchesService,
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: API_BASE } },
      ],
    });
    service = TestBed.inject(MatchesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMatches should GET /matches with page and size', () => {
    service.getMatches({ page: 1, size: 10 }).subscribe();
    const req = httpMock.expectOne(`${API_BASE}/matches?page=1&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0, page: 1, size: 10 });
  });

  it('getMatchById should GET /matches/:id', () => {
    service.getMatchById('abc').subscribe();
    const req = httpMock.expectOne(`${API_BASE}/matches/abc`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deleteMatch should DELETE /matches/:id', () => {
    service.deleteMatch('abc').subscribe();
    const req = httpMock.expectOne(`${API_BASE}/matches/abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getStatusLabel should return Spanish label', () => {
    expect(service.getStatusLabel(MatchStatusEnum.UPCOMING)).toBe('Próximo');
    expect(service.getStatusLabel(MatchStatusEnum.COMPLETED)).toBe(
      'Finalizado'
    );
    expect(service.getStatusLabel(MatchStatusEnum.CANCELLED)).toBe('Cancelado');
  });

});
