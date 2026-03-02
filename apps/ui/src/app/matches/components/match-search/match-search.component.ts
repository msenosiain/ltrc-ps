import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryEnum, MatchStatusEnum, MatchTypeEnum, SportEnum, Tournament } from '@ltrc-ps/shared-api-model';
import { matchCategoryOptions, matchStatusOptions, matchTypeOptions, sportOptions } from '../../match-options';
import { MatchFilters } from '../../forms/match-form.types';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';

@Component({
  selector: 'ltrc-match-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './match-search.component.html',
  styleUrl: './match-search.component.scss',
})
export class MatchSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tournamentsService = inject(TournamentsService);

  @Output() readonly filtersChange = new EventEmitter<MatchFilters>();

  readonly statusOptions = matchStatusOptions;
  readonly typeOptions = matchTypeOptions;
  readonly categoryOptions = matchCategoryOptions;
  readonly sportOptions = sportOptions;
  tournaments: Tournament[] = [];

  readonly searchForm = this.fb.group({
    status: [undefined as MatchStatusEnum | undefined],
    type: [undefined as MatchTypeEnum | undefined],
    sport: [undefined as SportEnum | undefined],
    category: [undefined as CategoryEnum | undefined],
    tournament: [undefined as string | undefined],
  });

  ngOnInit(): void {
    this.tournamentsService.getTournaments().subscribe((t) => (this.tournaments = t));

    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => this.filtersChange.emit(nullToUndefined(values) as MatchFilters));
  }
}