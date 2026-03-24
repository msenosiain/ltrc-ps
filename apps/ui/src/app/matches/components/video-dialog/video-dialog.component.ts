import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SquadEntry, VideoClip, VideoVisibility } from '@ltrc-campo/shared-api-model';

export interface VideoDialogData {
  squad: SquadEntry[];
  video?: VideoClip;
}

export interface VideoDialogResult {
  url: string;
  name: string;
  description?: string;
  visibility: VideoVisibility;
  targetPlayers?: string[];
}

@Component({
  selector: 'ltrc-video-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './video-dialog.component.html',
  styleUrl: './video-dialog.component.scss',
})
export class VideoDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<VideoDialogComponent>);
  readonly data: VideoDialogData = inject(MAT_DIALOG_DATA);

  readonly visibilityOptions: { id: VideoVisibility; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'staff', label: 'Solo staff' },
    { id: 'players', label: 'Jugadores específicos' },
  ];

  readonly form = this.fb.group({
    url: [this.data.video?.url ?? '', [Validators.required]],
    name: [this.data.video?.name ?? '', Validators.required],
    description: [this.data.video?.description ?? ''],
    visibility: [this.data.video?.visibility ?? 'all' as VideoVisibility, Validators.required],
    targetPlayers: [
      (this.data.video?.targetPlayers ?? []).map((p) => (p as any).id ?? (p as any)._id ?? p) as string[],
    ],
  });

  get showPlayerSelect(): boolean {
    return this.form.get('visibility')!.value === 'players';
  }

  get isEdit(): boolean {
    return !!this.data.video;
  }

  confirm(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: VideoDialogResult = {
      url: v.url!,
      name: v.name!,
      description: v.description || undefined,
      visibility: v.visibility as VideoVisibility,
      targetPlayers: v.visibility === 'players' ? (v.targetPlayers ?? []) : undefined,
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
