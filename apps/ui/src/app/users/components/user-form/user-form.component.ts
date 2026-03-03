import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Role } from '../../../auth/roles.enum';
import { roleOptions } from '../../user-options';
import { buildUserForm } from '../../forms/user-form.factory';
import { mapUserToForm } from '../../forms/user-form.mapper';
import { UserFormValue } from '../../forms/user-form.types';
import { User } from '../../User.interface';

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

  @Input() user?: User;
  @Input() submitting = false;
  @Output() readonly formSubmit = new EventEmitter<UserFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly roleOptions = roleOptions;
  readonly Role = Role;

  get isCreate(): boolean {
    return !this.user;
  }

  form = buildUserForm(this.fb, true);

  ngOnInit(): void {
    this.form = buildUserForm(this.fb, this.isCreate);
    if (this.user) {
      this.form.patchValue(mapUserToForm(this.user));
    }
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
    switch (role) {
      case Role.ADMIN: return 'warn';
      case Role.USER: return 'primary';
      case Role.PLAYER: return 'accent';
      default: return 'primary';
    }
  }
}
