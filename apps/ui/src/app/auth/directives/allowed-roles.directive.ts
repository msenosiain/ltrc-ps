import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, map, Subscription, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import { ViewAsRoleService } from '../services/view-as-role.service';
import { RoleEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { User } from '../../users/User.interface';

export type RoleRule = RoleEnum | { role: RoleEnum; sport: SportEnum };

@Directive({
  selector: '[ltrcAllowedRoles]',
})
export class AllowedRolesDirective implements OnInit, OnDestroy {
  @Input('ltrcAllowedRoles') allowedRoles?: RoleRule[];

  private readonly authService = inject(AuthService);
  private readonly viewAsService = inject(ViewAsRoleService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  // toObservable must be called in injection context — field initializer qualifies
  private readonly viewAsRole$ = toObservable(this.viewAsService.viewAsRole);

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = combineLatest([this.authService.user$, this.viewAsRole$])
      .pipe(
        map(([user, viewAsRole]) => {
          if (!user) return false;
          const effectiveUser = viewAsRole
            ? { ...user, roles: [viewAsRole], sports: Object.values(SportEnum), categories: [] }
            : user;
          return this.matchesAnyRule(effectiveUser as User);
        }),
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
