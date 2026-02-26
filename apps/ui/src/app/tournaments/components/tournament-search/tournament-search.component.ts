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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';

@Component({
  selector: 'ltrc-tournament-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './tournament-search.component.html',
  styleUrl: './tournament-search.component.scss',
})
export class TournamentSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly filtersChange = new EventEmitter<{ searchTerm?: string }>();

  readonly searchForm = this.fb.group({
    searchTerm: [''],
  });

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => this.filtersChange.emit(nullToUndefined(values)));
  }

  clearSearch(): void {
    this.searchForm.get('searchTerm')?.setValue('');
  }
}