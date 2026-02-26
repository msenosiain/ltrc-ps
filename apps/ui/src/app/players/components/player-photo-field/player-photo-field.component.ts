import { Component, forwardRef, inject, Input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlayerPhotoDialogComponent } from '../player-photo-dialog/player-photo-dialog.component';

export interface PhotoValue {
  file?: File;
  previewUrl: string;
}

@Component({
  selector: 'ltrc-player-photo-field',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlayerPhotoFieldComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PlayerPhotoFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="photo-field"
      [class.photo-field--filled]="value"
      [class.photo-field--error]="showError"
      [class.photo-field--disabled]="disabled"
      (click)="openDialog()"
      role="button"
      tabindex="0"
      [attr.aria-label]="value ? 'Cambiar foto del jugador' : 'Subir foto del jugador'"
      (keydown.enter)="openDialog()"
      (keydown.space)="openDialog()"
    >
      @if (value?.previewUrl) {
      <img
        [src]="value!.previewUrl"
        alt="Foto del jugador"
        class="photo-field__img"
      />
      <div class="photo-field__badge" aria-hidden="true">
        <mat-icon>edit</mat-icon>
      </div>
      } @else {
      <div class="photo-field__placeholder">
        <span>Sin foto</span>
      </div>
      }
    </div>

    @if (showError) {
    <span class="photo-field__error">La foto es obligatoria</span>
    }
  `,
  styles: [
    `
      .photo-field {
        width: 100%;
        aspect-ratio: 1 / 1;
        max-width: 160px;
        border-radius: 8px;
        overflow: visible;
        cursor: pointer;
        position: relative;
        background: #f5f5f5;
        border: 2px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus-visible {
          border-color: var(--mdc-theme-primary, #1976d2);
          outline: none;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
        }

        &--filled {
          border-style: solid;
          border-color: transparent;
          overflow: hidden;
        }

        &--error {
          border-color: var(--mdc-theme-error, #d32f2f);
        }

        &--disabled {
          opacity: 0.5;
          cursor: default;
        }
      }

      .photo-field__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 6px;
      }

      .photo-field__badge {
        position: absolute;
        bottom: -8px;
        right: -8px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: white;
        border: 1.5px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        z-index: 1;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #555;
        }
      }

      .photo-field__placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        pointer-events: none;
        font-size: 0.75rem;
        color: #9e9e9e;
        text-align: center;
        padding: 1rem;
        box-sizing: border-box;
      }

      .photo-field__error {
        display: block;
        font-size: 0.75rem;
        color: var(--mdc-theme-error, #d32f2f);
        margin-top: 4px;
      }
    `,
  ],
})
export class PlayerPhotoFieldComponent
  implements ControlValueAccessor, Validator, OnDestroy
{
  private dialog = inject(MatDialog);

  @Input() required = false;

  value: PhotoValue | null = null;
  disabled = false;
  touched = false;

  private onChange: (value: PhotoValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  get showError(): boolean {
    return this.touched && this.required && !this.value;
  }

  openDialog(): void {
    if (this.disabled) return;

    const ref = this.dialog.open(PlayerPhotoDialogComponent, {
      width: '320px',
    });

    const instance = ref.componentInstance;
    instance.hasCurrentPhoto = !!this.value;
    if (this.value?.previewUrl) {
      instance.previewUrl = this.value.previewUrl;
    }

    ref.afterClosed().subscribe((result) => {
      this.markAsTouched();
      if (!result) return;

      if (result.action === 'select') {
        this.value = { file: result.file, previewUrl: result.previewUrl };
        this.onChange(this.value);
      } else if (result.action === 'remove') {
        this.value = null;
        this.onChange(null);
      }
    });
  }

  writeValue(value: PhotoValue | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: PhotoValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  validate(): ValidationErrors | null {
    if (this.required && !this.value) {
      return { required: true };
    }
    return null;
  }

  private markAsTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  ngOnDestroy(): void {}
}
