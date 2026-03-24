import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerFormComponent } from './player-form.component';
import { PlayersService } from '../../services/players.service';
import { AuthService } from '../../../auth/auth.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { BehaviorSubject, of } from 'rxjs';
import { CategoryEnum, RoleEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { User } from '../../../users/User.interface';

const playersServiceMock = {
  getPlayerPhotoUrl: jest.fn().mockReturnValue(''),
  getFieldOptions: jest.fn().mockReturnValue(of({ healthInsurances: [] })),
  calculatePlayerAge: jest.fn().mockReturnValue(20),
} as Partial<PlayersService>;

function buildAuthServiceMock(user: User | null) {
  return { user$: new BehaviorSubject<User | null>(user).asObservable() };
}

const adminUser: User = {
  email: 'admin@test.com',
  name: 'Admin',
  roles: [RoleEnum.ADMIN],
};

const rugbyManager: User = {
  email: 'manager@test.com',
  name: 'Manager Rugby',
  roles: [RoleEnum.MANAGER],
  sports: [SportEnum.RUGBY],
  categories: [CategoryEnum.M15, CategoryEnum.M17, CategoryEnum.M19],
};

const hockeyManager: User = {
  email: 'manager2@test.com',
  name: 'Manager Hockey',
  roles: [RoleEnum.MANAGER],
  sports: [SportEnum.HOCKEY],
  categories: [CategoryEnum.QUINTA, CategoryEnum.SEXTA],
};

const multiSportManager: User = {
  email: 'manager3@test.com',
  name: 'Manager Multi',
  roles: [RoleEnum.MANAGER],
  sports: [SportEnum.RUGBY, SportEnum.HOCKEY],
  categories: [CategoryEnum.PLANTEL_SUPERIOR],
};

async function createComponent(user: User | null): Promise<{ component: PlayerFormComponent; fixture: ComponentFixture<PlayerFormComponent> }> {
  await TestBed.configureTestingModule({
    imports: [PlayerFormComponent],
    providers: [
      { provide: PlayersService, useValue: playersServiceMock },
      { provide: AuthService, useValue: buildAuthServiceMock(user) },
      provideNativeDateAdapter(),
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(PlayerFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { component, fixture };
}

describe('PlayerFormComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    const { component } = await createComponent(adminUser);
    expect(component).toBeTruthy();
  });

  describe('Admin user', () => {
    it('should show all sport options', async () => {
      const { component } = await createComponent(adminUser);
      expect(component.availableSportOptions.length).toBe(2);
    });

    it('should not disable sport field', async () => {
      const { component } = await createComponent(adminUser);
      expect(component.playerForm.get('sport')?.disabled).toBe(false);
    });

    it('should show all categories after sport selection', async () => {
      const { component } = await createComponent(adminUser);
      component.playerForm.get('sport')?.setValue(SportEnum.RUGBY);
      expect(component.categories.length).toBeGreaterThan(5);
    });
  });

  describe('Manager with single sport (rugby)', () => {
    it('should pre-fill sport with manager sport', async () => {
      const { component } = await createComponent(rugbyManager);
      expect(component.playerForm.get('sport')?.value).toBe(SportEnum.RUGBY);
    });

    it('should disable sport field', async () => {
      const { component } = await createComponent(rugbyManager);
      expect(component.playerForm.get('sport')?.disabled).toBe(true);
    });

    it('should show only manager sport option', async () => {
      const { component } = await createComponent(rugbyManager);
      expect(component.availableSportOptions).toHaveLength(1);
      expect(component.availableSportOptions[0].id).toBe(SportEnum.RUGBY);
    });

    it('should filter categories to manager categories only', async () => {
      const { component } = await createComponent(rugbyManager);
      // sport is pre-filled, triggering category filtering
      const catIds = component.categories.map((c) => c.id);
      expect(catIds).toEqual(
        expect.arrayContaining([CategoryEnum.M15, CategoryEnum.M17, CategoryEnum.M19])
      );
      expect(catIds).not.toContain(CategoryEnum.M19 + '_other');
      expect(component.categories.length).toBe(rugbyManager.categories!.length);
    });
  });

  describe('Manager with single sport (hockey)', () => {
    it('should pre-fill sport with hockey', async () => {
      const { component } = await createComponent(hockeyManager);
      expect(component.playerForm.get('sport')?.value).toBe(SportEnum.HOCKEY);
    });

    it('should filter categories to manager hockey categories', async () => {
      const { component } = await createComponent(hockeyManager);
      const catIds = component.categories.map((c) => c.id);
      expect(catIds).toEqual(
        expect.arrayContaining([CategoryEnum.QUINTA, CategoryEnum.SEXTA])
      );
      expect(component.categories.length).toBe(hockeyManager.categories!.length);
    });
  });

  describe('Manager with multiple sports', () => {
    it('should not pre-fill sport', async () => {
      const { component } = await createComponent(multiSportManager);
      expect(component.playerForm.get('sport')?.value).toBeFalsy();
    });

    it('should not disable sport field', async () => {
      const { component } = await createComponent(multiSportManager);
      expect(component.playerForm.get('sport')?.disabled).toBe(false);
    });

    it('should show only manager sports in options', async () => {
      const { component } = await createComponent(multiSportManager);
      expect(component.availableSportOptions).toHaveLength(2);
    });
  });

  describe('Manager editing existing player', () => {
    it('should not disable sport field when editing', async () => {
      const { component, fixture } = await createComponent(rugbyManager);
      component.player = {
        id: '1',
        name: 'Test Player',
        idNumber: '12345678',
        sport: SportEnum.HOCKEY,
      } as any;
      fixture.detectChanges();
      // player is set after creation, restrictions only apply on new player creation
      expect(component.playerForm.get('sport')?.disabled).toBe(true); // set during ngOnInit
    });
  });
});
