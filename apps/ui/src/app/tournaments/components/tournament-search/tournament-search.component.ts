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
import { SportEnum } from '@ltrc-campo/shared-api-model';
import { SportOption, sportOptions } from '../../../common/sport-options';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';

@Component({
  selector: 'ltrc-tournament-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './tournament-search.component.html',
  styleUrl: './tournament-search.component.scss',
})
export class TournamentSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterContext = inject(UserFilterContextService);

  @Input() initialFilters?: Record<string, unknown>;

  @Output() readonly filtersChange = new EventEmitter<{
    searchTerm?: string;
    sport?: SportEnum;
  }>();

  sportOptions: SportOption[] = sportOptions;
  showSportFilter = true;

  readonly searchForm = this.fb.group({
    searchTerm: [''],
    sport: [undefined as SportEnum | undefined],
  });

  ngOnInit(): void {
    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }

    this.filterContext.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.showSportFilter = ctx.showSportFilter;
        this.sportOptions = ctx.sportOptions;

        if (ctx.forcedSport) {
          this.searchForm
            .get('sport')!
            .setValue(ctx.forcedSport, { emitEvent: false });
        }

        this.emitFilters();
      });

    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
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
