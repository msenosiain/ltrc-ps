import { AllowedRolesDirective } from './allowed-roles.directive';
import { AuthService } from '../auth.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../users/User.interface';
import { RoleEnum } from '@ltrc-ps/shared-api-model';
import { By } from '@angular/platform-browser';
class MockAuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  setUser(user: User | null) {
    this.userSubject.next(user);
  }
}
@Component({
  template: `<p *ltrcAllowedRoles="[RoleEnum.ADMIN]" class="admin-content">
    Admin Only
  </p>`,
  imports: [AllowedRolesDirective],
})
class TestComponent {
  RoleEnum = RoleEnum;
}
describe('AllowedRolesDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockService: MockAuthService;
  beforeEach(() => {
    mockService = new MockAuthService();
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [{ provide: AuthService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });
  it('should show element when user is admin', () => {
    mockService.setUser({
      googleId: '1234',
      name: 'Alice Cooper',
      email: 'alice.cooper@lostordos.com.ar',
      roles: [RoleEnum.ADMIN],
    });
    fixture.detectChanges();
    const content = fixture.debugElement.query(By.css('.admin-content'));
    expect(content).toBeTruthy();
    expect(content.nativeElement.textContent.trim()).toBe('Admin Only');
  });
  it('should hide element when user is not admin', () => {
    mockService.setUser({
      googleId: '1234',
      name: 'Alice Cooper',
      email: 'alice.cooper@lostordos.com.ar',
      roles: [RoleEnum.MANAGER],
    });
    fixture.detectChanges();
    const content = fixture.debugElement.query(By.css('.admin-content'));
    expect(content).toBeNull();
  });
});
