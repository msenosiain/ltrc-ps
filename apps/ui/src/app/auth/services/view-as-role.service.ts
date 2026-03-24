import { Injectable, signal } from '@angular/core';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Injectable({ providedIn: 'root' })
export class ViewAsRoleService {
  private readonly _viewAsRole = signal<RoleEnum | null>(null);
  readonly viewAsRole = this._viewAsRole.asReadonly();

  set(role: RoleEnum | null): void {
    this._viewAsRole.set(role);
  }

  clear(): void {
    this._viewAsRole.set(null);
  }
}
