import { Component, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormSkeletonComponent } from '../../../common/components/form-skeleton/form-skeleton.component';
import { ClothingSizesEnum } from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-my-profile-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    FormSkeletonComponent,
  ],
  templateUrl: './my-profile-editor.component.html',
  styleUrl: './my-profile-editor.component.scss',
})
export class MyProfileEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly sizeOptions = Object.values(ClothingSizesEnum);

  loading = signal(true);
  saving = false;

  form: FormGroup = this.fb.group({
    phoneNumber: [''],
    jersey: [null],
    shorts: [null],
    sweater: [null],
    pants: [null],
  });

  ngOnInit(): void {
    this.playersService.getMyPlayer().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (player) => {
        this.form.patchValue({
          phoneNumber: player.address?.phoneNumber ?? '',
          jersey: player.clothingSizes?.jersey ?? null,
          shorts: player.clothingSizes?.shorts ?? null,
          sweater: player.clothingSizes?.sweater ?? null,
          pants: player.clothingSizes?.pants ?? null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;

    const v = this.form.value;
    const dto: { address?: { phoneNumber?: string }; clothingSizes?: Record<string, string> } = {};

    if (v.phoneNumber !== null && v.phoneNumber !== undefined) {
      dto.address = { phoneNumber: v.phoneNumber };
    }

    const sizes: Record<string, string> = {};
    if (v.jersey) sizes['jersey'] = v.jersey;
    if (v.shorts) sizes['shorts'] = v.shorts;
    if (v.sweater) sizes['sweater'] = v.sweater;
    if (v.pants) sizes['pants'] = v.pants;
    if (Object.keys(sizes).length) dto.clothingSizes = sizes;

    this.playersService.updateMyProfile(dto).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar el perfil', 'Cerrar', { duration: 4000 });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
