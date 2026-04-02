import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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

  describe('showPlayerStats', () => {
    it('should be true for ADMIN', async () => {
      await createComponent({ roles: [RoleEnum.ADMIN] });
      expect(component.showPlayerStats()).toBe(true);
    });
    it('should be true for MANAGER', async () => {
      await createComponent({ roles: [RoleEnum.MANAGER] });
      expect(component.showPlayerStats()).toBe(true);
    });
    it('should be true for COORDINATOR', async () => {
      await createComponent({ roles: [RoleEnum.COORDINATOR] });
      expect(component.showPlayerStats()).toBe(true);
    });
    it('should be true for COACH', async () => {
      await createComponent({ roles: [RoleEnum.COACH] });
      expect(component.showPlayerStats()).toBe(true);
    });
    it('should be false for TRAINER', async () => {
      await createComponent({ roles: [RoleEnum.TRAINER] });
      expect(component.showPlayerStats()).toBe(false);
    });
    it('should be false for PLAYER', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] });
      expect(component.showPlayerStats()).toBe(false);
    });
  });

  describe('showTrainingStats', () => {
    it('should be true for TRAINER', async () => {
      await createComponent({ roles: [RoleEnum.TRAINER] });
      expect(component.showTrainingStats()).toBe(true);
    });
    it('should be true for COACH', async () => {
      await createComponent({ roles: [RoleEnum.COACH] });
      expect(component.showTrainingStats()).toBe(true);
    });
    it('should be false for ANALYST', async () => {
      await createComponent({ roles: [RoleEnum.ANALYST] });
      expect(component.showTrainingStats()).toBe(false);
    });
    it('should be false for PLAYER', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] });
      expect(component.showTrainingStats()).toBe(false);
    });
  });

  describe('showInjured', () => {
    it('should be true for KINE', async () => {
      await createComponent({ roles: [RoleEnum.KINE] });
      expect(component.showInjured()).toBe(true);
    });
    it('should be true for ANALYST', async () => {
      await createComponent({ roles: [RoleEnum.ANALYST] });
      expect(component.showInjured()).toBe(true);
    });
    it('should be false for PLAYER', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] });
      expect(component.showInjured()).toBe(false);
    });
  });

  describe('viewAs overrides', () => {
    it('showPlayerStats: viewAs COACH overrides PLAYER role', async () => {
      await createComponent({ roles: [RoleEnum.PLAYER] }, RoleEnum.COACH);
      expect(component.showPlayerStats()).toBe(true);
    });
    it('showTrainingStats: viewAs PLAYER hides stats for COORDINATOR', async () => {
      await createComponent({ roles: [RoleEnum.COORDINATOR] }, RoleEnum.PLAYER);
      expect(component.showTrainingStats()).toBe(false);
    });
  });
});
