import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Role } from '@ltrc-ps/shared-api-model';
import { roleOptions, getRoleColor } from '../../user-options';
import { buildUserForm } from '../../forms/user-form.factory';
import { mapUserToForm } from '../../forms/user-form.mapper';
import { UserFormValue } from '../../forms/user-form.types';
import { User } from '../../User.interface';
import { sportOptions } from '../../../common/sport-options';
import { categoryOptions } from '../../../common/category-options';

@Component({
  selector: 'ltrc-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input() user?: User;
  @Input() submitting = false;
  @Output() readonly formSubmit = new EventEmitter<UserFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly roleOptions = roleOptions;
  readonly sportOptions = sportOptions;
  readonly categoryOptions = categoryOptions;
  readonly Role = Role;

  get isCreate(): boolean {
    return !this.user;
  }

  get isCoach(): boolean {
    return this.form.get('roles')?.value?.includes(Role.COACH) ?? false;
  }

  form = buildUserForm(this.fb, true);

  ngOnInit(): void {
    this.form = buildUserForm(this.fb, this.isCreate);
    if (this.user) {
      this.form.patchValue(mapUserToForm(this.user));
    }

    this.form.get('roles')!
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((roles: Role[]) => {
        if (!roles.includes(Role.COACH)) {
          this.form.patchValue({ sports: [], categories: [] });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.form.patchValue(mapUserToForm(this.user));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formSubmit.emit(this.form.getRawValue() as UserFormValue);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getRoleColor(role: Role): string {
    return getRoleColor(role);
  }
}
