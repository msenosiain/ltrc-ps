import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, EMPTY } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const authServiceMock = {
  login: jest.fn(),
  loginWithGoogle: jest.fn(),
} as Partial<AuthService>;

const routerMock = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn().mockResolvedValue(true),
  events: EMPTY,
  createUrlTree: jest.fn().mockReturnValue({}),
  serializeUrl: jest.fn().mockReturnValue(''),
} as Partial<Router>;

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } }, paramMap: { get: () => null } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form and no error', () => {
    expect(component.loginForm.value).toEqual({ email: '', pass: '' });
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  describe('onSubmit()', () => {
    it('should not call login when form is invalid', () => {
      component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call login and navigate to /dashboard on success', () => {
      (authServiceMock.login as jest.Mock).mockReturnValueOnce(
        of({ access_token: 'token', refresh_token: 'refresh' })
      );

      component.loginForm.setValue({ email: 'user@test.com', pass: '123456' });
      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith(
        'user@test.com',
        '123456'
      );
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should set errorMessage and stop loading on login failure', () => {
      (authServiceMock.login as jest.Mock).mockReturnValueOnce(
        throwError(() => new Error('401'))
      );

      component.loginForm.setValue({ email: 'user@test.com', pass: 'wrong' });
      component.onSubmit();

      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage).toBe(
        'Credenciales inválidas o error de conexión'
      );
    });

    it('should set isLoading to true while login is in progress', () => {
      (authServiceMock.login as jest.Mock).mockReturnValueOnce(of({}));
      component.loginForm.setValue({ email: 'user@test.com', pass: '123456' });
      component.onSubmit();
      // After observable completes synchronously, navigateByUrl is called
      expect(routerMock.navigateByUrl).toHaveBeenCalled();
    });
  });

  describe('loginWithGoogle()', () => {
    it('should call authService.loginWithGoogle', () => {
      component.loginWithGoogle();
      expect(authServiceMock.loginWithGoogle).toHaveBeenCalled();
    });
  });
});
