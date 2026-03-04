import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { CategoryEnum, SportEnum } from '@ltrc-ps/shared-api-model';
import { UserFilterContextService } from './user-filter-context.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../users/User.interface';
import { sportOptions } from '../sport-options';
import { categoryOptions } from '../category-options';

describe('UserFilterContextService', () => {
  let service: UserFilterContextService;
  let userSubject: BehaviorSubject<User | null>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);

    TestBed.configureTestingModule({
      providers: [
        UserFilterContextService,
        { provide: AuthService, useValue: { user$: userSubject.asObservable() } },
      ],
    });

    service = TestBed.inject(UserFilterContextService);
  });

  function emitUser(overrides: Partial<User> = {}): void {
    userSubject.next({
      email: 'test@test.com',
      name: 'Test',
      lastName: 'User',
      roles: [],
      sports: [],
      categories: [],
      ...overrides,
    });
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empty arrays → all visible, all options', (done) => {
    emitUser({ sports: [], categories: [] });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showSportFilter).toBe(true);
      expect(ctx.showCategoryFilter).toBe(true);
      expect(ctx.sportOptions).toEqual(sportOptions);
      expect(ctx.categoryOptions).toEqual(categoryOptions);
      expect(ctx.forcedSport).toBeUndefined();
      expect(ctx.forcedCategory).toBeUndefined();
      done();
    });
  });

  it('single sport → hidden, forcedSport set', (done) => {
    emitUser({ sports: [SportEnum.RUGBY], categories: [] });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showSportFilter).toBe(false);
      expect(ctx.forcedSport).toBe(SportEnum.RUGBY);
      expect(ctx.sportOptions).toHaveLength(1);
      expect(ctx.sportOptions[0].id).toBe(SportEnum.RUGBY);
      // Categories should be filtered to rugby + shared
      expect(ctx.categoryOptions.every(
        (c) => c.sport === null || c.sport === SportEnum.RUGBY
      )).toBe(true);
      done();
    });
  });

  it('single category → hidden, forcedCategory set', (done) => {
    emitUser({ sports: [], categories: [CategoryEnum.PLANTEL_SUPERIOR] });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showCategoryFilter).toBe(false);
      expect(ctx.forcedCategory).toBe(CategoryEnum.PLANTEL_SUPERIOR);
      expect(ctx.categoryOptions).toHaveLength(1);
      done();
    });
  });

  it('multiple sports → visible, limited options', (done) => {
    emitUser({ sports: [SportEnum.RUGBY, SportEnum.HOCKEY], categories: [] });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showSportFilter).toBe(true);
      expect(ctx.forcedSport).toBeUndefined();
      expect(ctx.sportOptions).toHaveLength(2);
      done();
    });
  });

  it('multiple categories → visible, limited options', (done) => {
    emitUser({
      sports: [],
      categories: [CategoryEnum.PLANTEL_SUPERIOR, CategoryEnum.M19],
    });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showCategoryFilter).toBe(true);
      expect(ctx.forcedCategory).toBeUndefined();
      expect(ctx.categoryOptions).toHaveLength(2);
      done();
    });
  });

  it('single sport + single category → both hidden, both forced', (done) => {
    emitUser({
      sports: [SportEnum.RUGBY],
      categories: [CategoryEnum.M19],
    });

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showSportFilter).toBe(false);
      expect(ctx.showCategoryFilter).toBe(false);
      expect(ctx.forcedSport).toBe(SportEnum.RUGBY);
      expect(ctx.forcedCategory).toBe(CategoryEnum.M19);
      done();
    });
  });

  it('null user → all visible, all options', (done) => {
    userSubject.next(null);

    service.filterContext$.subscribe((ctx) => {
      expect(ctx.showSportFilter).toBe(true);
      expect(ctx.showCategoryFilter).toBe(true);
      expect(ctx.sportOptions).toEqual(sportOptions);
      expect(ctx.categoryOptions).toEqual(categoryOptions);
      done();
    });
  });
});
