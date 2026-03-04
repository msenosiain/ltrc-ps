import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Role } from '@ltrc-ps/shared-api-model';
import { roleOptions } from '../../user-options';
import { UserFilters } from '../../forms/user-form.types';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';

@Component({
  selector: 'ltrc-user-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.scss',
})
export class UserSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly filtersChange = new EventEmitter<UserFilters>();

  readonly roleOptions = roleOptions;

  readonly searchForm = this.fb.group({
    searchTerm: [''],
    role: [undefined as Role | undefined],
  });

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) =>
        this.filtersChange.emit(nullToUndefined(values) as UserFilters)
      );
  }

  clearField(field: string): void {
    this.searchForm.get(field)?.setValue(undefined);
  }
}
