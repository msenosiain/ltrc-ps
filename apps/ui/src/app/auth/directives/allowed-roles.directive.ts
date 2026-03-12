import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { distinctUntilChanged, map, Subscription, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import { RoleEnum, SportEnum } from '@ltrc-ps/shared-api-model';
import { User } from '../../users/User.interface';

export type RoleRule = RoleEnum | { role: RoleEnum; sport: SportEnum };

@Directive({
  selector: '[ltrcAllowedRoles]',
})
export class AllowedRolesDirective implements OnInit, OnDestroy {
  @Input('ltrcAllowedRoles') allowedRoles?: RoleRule[];
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<unknown>
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.user$
      .pipe(
        map((user) => Boolean(user && this.matchesAnyRule(user))),
        distinctUntilChanged(),
        tap((allowed) =>
          allowed
            ? this.viewContainerRef.createEmbeddedView(this.templateRef)
            : this.viewContainerRef.clear()
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private matchesAnyRule(user: User): boolean {
    if (!this.allowedRoles) return false;
    return this.allowedRoles.some((rule) => {
      if (typeof rule === 'string') {
        return user.roles.includes(rule);
      }
      return (
        user.roles.includes(rule.role) &&
        (user.sports ?? []).includes(rule.sport)
      );
    });
  }
}
