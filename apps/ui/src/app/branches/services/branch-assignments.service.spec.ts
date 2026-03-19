import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BranchAssignmentsService } from './branch-assignments.service';
import { API_CONFIG_TOKEN } from '../../app.config';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

const API_BASE = 'http://localhost:3000/api/v1';

describe('BranchAssignmentsService', () => {
  let service: BranchAssignmentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BranchAssignmentsService,
        { provide: API_CONFIG_TOKEN, useValue: { baseUrl: API_BASE } },
      ],
    });
    service = TestBed.inject(BranchAssignmentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should GET /branch-assignments with filter params', () => {
    service
      .findAll({
        season: 2025,
        category: CategoryEnum.CUARTA,
        branch: HockeyBranchEnum.A,
      })
      .subscribe();

    const req = httpMock.expectOne(
      `${API_BASE}/branch-assignments?season=2025&category=${CategoryEnum.CUARTA}&branch=${HockeyBranchEnum.A}`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('findAll should omit undefined filter params', () => {
    service.findAll({ season: 2025 }).subscribe();

    const req = httpMock.expectOne(
      `${API_BASE}/branch-assignments?season=2025`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create should POST /branch-assignments with body', () => {
    service
      .create('player1', HockeyBranchEnum.A, CategoryEnum.CUARTA, 2025)
      .subscribe();

    const req = httpMock.expectOne(`${API_BASE}/branch-assignments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      player: 'player1',
      branch: HockeyBranchEnum.A,
      category: CategoryEnum.CUARTA,
      season: 2025,
      sport: SportEnum.HOCKEY,
    });
    req.flush({});
  });

  it('updateBranch should PATCH /branch-assignments/:id', () => {
    service.updateBranch('abc', HockeyBranchEnum.B).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/branch-assignments/abc`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ branch: HockeyBranchEnum.B });
    req.flush({});
  });

  it('delete should DELETE /branch-assignments/:id', () => {
    service.delete('abc').subscribe();

    const req = httpMock.expectOne(`${API_BASE}/branch-assignments/abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('importFromFile should POST /branch-assignments/import with FormData', () => {
    const file = new File(['content'], 'branches.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    service.importFromFile(file, 2025).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/branch-assignments/import`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ created: 5, updated: 2, errors: [] });
  });
});
