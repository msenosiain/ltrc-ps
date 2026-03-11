import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  OnInit,
  DestroyRef,
  computed,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Observable, startWith, map } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  ClothingSizesEnum,
  HockeyBranchEnum,
  Player,
  Role,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  getCategoryOptionsBySport,
  CategoryOption,
} from '../../../common/category-options';
import { sportOptions } from '../../../common/sport-options';
import {
  getPositionOptionsBySport,
  PositionOption,
} from '../../position-options';
import { buildCreatePlayerForm } from '../../forms/player-form.factory';
import { PlayerFormValue } from '../../forms/player-form.types';
import { PlayersService } from '../../services/players.service';
import { PlayerPhotoFieldComponent } from '../player-photo-field/player-photo-field.component';
import { AuthService } from '../../../auth/auth.service';

export interface PlayerFormSubmitEvent {
  payload: PlayerFormValue;
  file?: File;
}

@Component({
  standalone: true,
  selector: 'ltrc-player-form',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatCheckboxModule,
    PlayerPhotoFieldComponent,
  ],
  styleUrls: ['./player-form.component.scss'],
  templateUrl: './player-form.component.html',
})
export class PlayerFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  private readonly currentUser = toSignal(this.authService.user$);
  readonly isAdmin = computed(
    () => this.currentUser()?.roles?.includes(Role.ADMIN) ?? false
  );

  private readonly selectedPosition = signal<string | null>(null);
  readonly filteredAlternatePositions = computed(() =>
    this.positions.filter((p) => p.id !== this.selectedPosition())
  );

  @Input() player?: Player;
  @Input() submitting = false;

  @Output() readonly formSubmitWithPhoto =
    new EventEmitter<PlayerFormSubmitEvent>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly sportOptions = sportOptions;
  readonly branchOptions = Object.values(HockeyBranchEnum);
  readonly clothingSizesOptions = Object.values(ClothingSizesEnum);

  positions: PositionOption[] = getPositionOptionsBySport(null);
  categories: CategoryOption[] = getCategoryOptionsBySport(null);

  get isHockey(): boolean {
    return this.playerForm.get('sport')?.value === SportEnum.HOCKEY;
  }

  playerForm: FormGroup = buildCreatePlayerForm(this.fb);

  private allHealthInsurances: string[] = [];
  filteredHealthInsurances$!: Observable<string[]>;

  ngOnInit(): void {
    this.playerForm.get('position')!.valueChanges.subscribe((val) => {
      this.selectedPosition.set(val);
    });

    this.filteredHealthInsurances$ = this.playerForm
      .get('medicalData.healthInsurance')!
      .valueChanges.pipe(
        startWith(''),
        map((v) => {
          const lc = (v ?? '').toLowerCase();
          return this.allHealthInsurances.filter((o) =>
            o.toLowerCase().includes(lc)
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      );

    this.playersService
      .getFieldOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ healthInsurances }) => {
        this.allHealthInsurances = healthInsurances;
      });
    this.playerForm
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport: SportEnum | null) => {
        this.positions = getPositionOptionsBySport(sport);
        this.categories = getCategoryOptionsBySport(sport);
        // Clear position/category if they no longer match the new sport
        const pos = this.playerForm.get('position')?.value;
        if (pos && !this.positions.find((p) => p.id === pos)) {
          this.playerForm.get('position')?.setValue(null);
        }
        const cat = this.playerForm.get('category')?.value;
        if (cat && !this.categories.find((c) => c.id === cat)) {
          this.playerForm.get('category')?.setValue(null);
        }
        // Clear branch if sport is not hockey
        if (sport !== SportEnum.HOCKEY) {
          this.playerForm.get('branch')?.setValue(null);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && this.player) {
      this.playerForm.patchValue(this.player);
      // Trigger sport-based option filtering for loaded player
      const sport = this.player.sport ?? null;
      this.positions = getPositionOptionsBySport(sport);
      this.categories = getCategoryOptionsBySport(sport);

      if (this.player.photoId && this.player.id) {
        this.playerForm.get('photo')?.setValue({
          previewUrl: this.playersService.getPlayerPhotoUrl(this.player.id),
        });
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.playerForm.invalid) return;
    const photoValue = this.playerForm.get('photo')?.value;
    this.formSubmitWithPhoto.emit({
      payload: this.playerForm.getRawValue() as PlayerFormValue,
      file: photoValue?.file,
    });
  }
}
