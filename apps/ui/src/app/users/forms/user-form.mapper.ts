import { User } from '../User.interface';
import { UserFormValue } from './user-form.types';
import { CreateUserPayload, UpdateUserPayload } from '../services/users.service';

export function mapFormToCreateUserDto(value: UserFormValue): CreateUserPayload {
  return {
    name: value.name,
    lastName: value.lastName,
    email: value.email,
    roles: value.roles,
    password: value.password || undefined,
  };
}

export function mapFormToUpdateUserDto(value: UserFormValue): UpdateUserPayload {
  return {
    name: value.name,
    lastName: value.lastName,
    email: value.email,
    roles: value.roles,
  };
}

export function mapUserToForm(user: User): UserFormValue {
  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    roles: user.roles,
    password: undefined,
  };
}
