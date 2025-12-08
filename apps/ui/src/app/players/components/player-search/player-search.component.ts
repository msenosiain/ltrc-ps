import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';
import { PositionOption, positionOptions } from '../../position-options';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'ltrc-player-search',
  templateUrl: './player-search.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  styleUrls: ['./player-search.component.scss'],
})
export class PlayerSearchComponent {
  @Output() filtersChange = new EventEmitter<{
    searchTerm?: string;
    position?: PlayerPositionEnum;
  }>();

  searchForm: FormGroup;
  positionOptions: PositionOption[] = positionOptions;
  private fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      position: [undefined],
    });

    // Emitir cambios con debounce
    this.searchForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe((values) => this.filtersChange.emit(values));
  }

  clearField(field: string) {
    this.searchForm.get(field)?.setValue(undefined);
  }
}
