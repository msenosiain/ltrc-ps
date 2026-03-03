import { FormBuilder, Validators } from '@angular/forms';
import { Role } from '../../auth/roles.enum';

export function buildUserForm(fb: FormBuilder, isCreate = false) {
  return fb.group({
    name: fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    lastName: fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    email: fb.nonNullable.control('', [Validators.required, Validators.email]),
    roles: fb.nonNullable.control<Role[]>([Role.USER], Validators.required),
    password: fb.control<string | null>(
      null,
      isCreate ? [] : []
    ),
  });
}
