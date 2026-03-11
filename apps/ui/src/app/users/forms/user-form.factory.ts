import { FormBuilder, Validators } from '@angular/forms';
import { CategoryEnum, HockeyBranchEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

export function buildUserForm(fb: FormBuilder, isCreate = false) {
  return fb.group({
    name: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    lastName: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    email: fb.nonNullable.control('', [Validators.required, Validators.email]),
    roles: fb.nonNullable.control<Role[]>([], Validators.required),
    password: fb.control<string | null>(null, isCreate ? [] : []),
    sports: fb.nonNullable.control<SportEnum[]>([]),
    categories: fb.nonNullable.control<CategoryEnum[]>([]),
    branches: fb.nonNullable.control<HockeyBranchEnum[]>([]),
  });
}
