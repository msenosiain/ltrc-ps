import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { PlayersService } from '../players/services/players.service';
import { AuthService } from '../auth/auth.service';
import { SidenavService } from '../common/services/sidenav.service';
import { ViewAsRoleService } from '../auth/services/view-as-role.service';
import { RoleEnum } from '@ltrc-campo/shared-api-model';
import { User } from '../users/User.interface';

const mockPlayersService = {
  getMyPlayer: jest.fn().mockReturnValue(of(null)),
};

const mockSidenavService = {
  toggle$: of(),
};

function createAuthService(user: Partial<User> | null) {
  return { user$: of(user) };
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  async function createComponent(user: Partial<User> | null = null, viewAsRole: RoleEnum | null = null) {
    const mockViewAsService = {
      viewAsRole: () => viewAsRole,
      set: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: PlayersService, useValue: mockPlayersService },
        { provide: AuthService, useValue: createAuthService(user) },
        { provide: SidenavService, useValue: mockSidenavService },
        { provide: ViewAsRoleService, useValue: mockViewAsService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await createComponent(null);
    expect(component).toBeTruthy();
  });

  describe('canViewStats', () => {
    it('should return true for COORDINATOR role', async () => {
      await createComponent({ roles: [RoleEnum.COORDINATOR] });
      expect(component.canViewStats()).toBe(true);
    });

    it('should return true for MANAGER role', async () => {
      await createComponent({ roles: [RoleEnum.MANAGER] });
      expect(component.canViewStats()).toBe(true);
    });

    it('should return true for TRAINER role', async () => {
      await createComponent({ roles: [RoleEnum.TRAINER] });
      expect(component.canViewStats()).toBe(true);
    });

    it('should return false for PLAYER role', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] });
      expect(component.canViewStats()).toBe(false);
    });

    it('should return true for COACH role', async () => {
      await createComponent({ roles: [RoleEnum.COACH] });
      expect(component.canViewStats()).toBe(true);
    });

    it('should return false for ADMIN role (not in the allowed set)', async () => {
      await createComponent({ roles: [RoleEnum.ADMIN] });
      expect(component.canViewStats()).toBe(false);
    });

    it('should return false when user has no roles', async () => {
      await createComponent({ roles: [] });
      expect(component.canViewStats()).toBe(false);
    });

    it('should return false when user is null', async () => {
      await createComponent(null);
      expect(component.canViewStats()).toBe(false);
    });

    it('should return true when viewAsRole is COORDINATOR', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] }, RoleEnum.COORDINATOR);
      expect(component.canViewStats()).toBe(true);
    });

    it('should return true when viewAsRole is MANAGER', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] }, RoleEnum.MANAGER);
      expect(component.canViewStats()).toBe(true);
    });

    it('should return true when viewAsRole is TRAINER', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] }, RoleEnum.TRAINER);
      expect(component.canViewStats()).toBe(true);
    });

    it('should return true when viewAsRole is COACH', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] }, RoleEnum.COACH);
      expect(component.canViewStats()).toBe(true);
    });

    it('should return false when viewAsRole is PLAYER', async () => {
      await createComponent({ roles: [RoleEnum.COORDINATOR] }, RoleEnum.PLAYER);
      expect(component.canViewStats()).toBe(false);
    });
  });
});
