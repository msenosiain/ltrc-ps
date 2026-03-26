import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExerciseVideo } from '@ltrc-campo/shared-api-model';

export interface ExerciseVideoDialogData {
  exerciseName: string;
  videos: ExerciseVideo[];
}

@Component({
  selector: 'ltrc-exercise-video-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './exercise-video-dialog.component.html',
  styleUrl: './exercise-video-dialog.component.scss',
})
export class ExerciseVideoDialogComponent {
  readonly data = inject<ExerciseVideoDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ExerciseVideoDialogComponent>);
  private readonly sanitizer = inject(DomSanitizer);

  selectedIndex = 0;

  getEmbedUrl(url: string): SafeResourceUrl | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
    if (ytMatch) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&loop=1&playlist=${ytMatch[1]}`
      );
    }
    return null;
  }

  isDirectVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
  }

  getVideoTitle(video: ExerciseVideo, index: number): string {
    return video.title || `Video ${index + 1}`;
  }
}
