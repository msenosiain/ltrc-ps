import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SportEnum, TripStatusEnum } from '@ltrc-ps/shared-api-model';
import { SportOption, sportOptions } from '../../../common/sport-options';
import { TripListFilters } from '../../services/trips.datasource';
import { tripStatusOptions, TripOption } from '../../trip-options';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';

@Component({
  selector: 'ltrc-trip-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './trip-search.component.html',
  styleUrl: './trip-search.component.scss',
})
export class TripSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input() initialFilters?: Record<string, unknown>;
  @Output() readonly filtersChange = new EventEmitter<TripListFilters>();

  readonly sportOptions: SportOption[] = sportOptions;
  readonly statusOptions: TripOption<TripStatusEnum>[] = tripStatusOptions;

  readonly searchForm = this.fb.group({
    searchTerm: [''],
    sport: [undefined as SportEnum | undefined],
    status: [undefined as TripStatusEnum | undefined],
  });

  ngOnInit(): void {
    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }
    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());

    this.emitFilters();
  }

  clearSearch(): void {
    this.searchForm.get('searchTerm')?.setValue('');
  }

  clearField(field: string): void {
    this.searchForm.get(field)?.setValue(undefined);
  }

  private emitFilters(): void {
    this.filtersChange.emit(nullToUndefined(this.searchForm.value));
  }
}
