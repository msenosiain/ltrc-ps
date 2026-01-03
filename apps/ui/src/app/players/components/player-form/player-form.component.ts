import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Player, PlayerPositionEnum } from '@ltrc-ps/shared-api-model';
import { positionOptions } from '../../position-options';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  selector: 'ltrc-player-form',
  styleUrls: ['./player-form.component.scss'],
  templateUrl: './player-form.component.html',
})
export class PlayerFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() player?: Player; // Si viene, es edición
  @Input() submitting = false;

  @Output() formSubmit = new EventEmitter<Partial<Player>>();

  positions = positionOptions;

  playerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nickName: [''],
    idNumber: ['', Validators.required, Validators.maxLength(8)],
    birthDate: ['', Validators.required],
    email: ['', Validators.required, Validators.email],
    position: [null, Validators.required],
    alternatePosition: [null],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['player'] && this.player) {
      this.playerForm.patchValue(this.player);
    }
  }

  onSubmit() {
    if (this.playerForm.invalid) return;
    this.formSubmit.emit(this.playerForm.value);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    const option = this.positions.find((o) => o.id === position);
    return option ? option.name : position;
  }
}
