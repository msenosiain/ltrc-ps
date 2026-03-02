import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  computed,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Player, ClothingSizesEnum } from '@ltrc-ps/shared-api-model';
import { positionOptions } from '../../position-options';
import { buildCreatePlayerForm } from '../../forms/player-form.factory';
import { PlayerFormValue } from '../../forms/player-form.types';
import { PlayersService } from '../../services/players.service';
import { PlayerPhotoFieldComponent } from '../player-photo-field/player-photo-field.component';
import { AuthService } from '../../../auth/auth.service';
import { Role } from '../../../auth/roles.enum';

export interface PlayerFormSubmitEvent {
  payload: PlayerFormValue;
  file?: File;
}

@Component({
  standalone: true,
  selector: 'ltrc-player-form',
  imports: [
    ReactiveFormsModule,
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
export class PlayerFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly authService = inject(AuthService);

  private readonly currentUser = toSignal(this.authService.user$);
  readonly isAdmin = computed(() =>
    this.currentUser()?.roles?.includes(Role.ADMIN) ?? false
  );

  private readonly selectedPosition = signal<string | null>(null);
  readonly filteredAlternatePositions = computed(() =>
    this.positions.filter(p => p.id !== this.selectedPosition())
  );

  @Input() player?: Player;
  @Input() submitting = false;

  @Output() readonly formSubmitWithPhoto =
    new EventEmitter<PlayerFormSubmitEvent>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly positions = positionOptions;
  readonly clothingSizesOptions = Object.values(ClothingSizesEnum);

  playerForm: FormGroup = buildCreatePlayerForm(this.fb);

  constructor() {
    this.playerForm.get('position')!.valueChanges.subscribe(val => {
      this.selectedPosition.set(val);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && this.player) {
      this.playerForm.patchValue(this.player);
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
