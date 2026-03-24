import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Subscription, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
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
  private sub?: Subscription;

  private readonly authService = inject(AuthService);
  private readonly viewAsService = inject(ViewAsRoleService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  ngOnInit(): void {
    const viewAsRole$ = toObservable(this.viewAsService.viewAsRole);

    this.sub = combineLatest([this.authService.user$, viewAsRole$])
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
