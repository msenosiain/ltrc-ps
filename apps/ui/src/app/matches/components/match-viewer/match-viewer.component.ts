import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import {
  AttendanceEntry,
  AttendanceStatusEnum,
  CategoryEnum,
  Match,
  MatchAttachment,
  MatchStatusEnum,
  RoleEnum,
  SportEnum,
  SquadEntry,
  Tournament,
  VideoClip,
  isCompetitiveCategory,
} from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { getCategoryLabel as getCatLabel } from '../../match-options';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayersService } from '../../../players/services/players.service';
import { SquadPdfService } from '../../services/squad-pdf.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadAttachmentDialogComponent, UploadAttachmentResult } from '../upload-attachment-dialog/upload-attachment-dialog.component';
import { VideoDialogComponent, VideoDialogData, VideoDialogResult } from '../video-dialog/video-dialog.component';

@Component({
  selector: 'ltrc-match-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './match-viewer.component.html',
  styleUrl: './match-viewer.component.scss',
})
export class MatchViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly playersService = inject(PlayersService);
  private readonly squadPdf = inject(SquadPdfService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  match?: Match;
  isCompetitive = false;
  uploadingAttachment = false;
  readonly MatchStatusEnum = MatchStatusEnum;
  readonly AttendanceStatusEnum = AttendanceStatusEnum;
  readonly RoleEnum = RoleEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/matches']);
      return;
    }

    this.matchesService
      .getMatchById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (match) => {
          this.match = match;
          const tournament = match.tournament as Tournament | undefined;
          const sport = tournament?.sport ?? match.sport;
          if (match.category && sport) {
            this.isCompetitive = isCompetitiveCategory(match.category, sport);
          }
        },
        error: () => this.router.navigate(['/dashboard/matches']),
      });
  }

  get tournament(): Tournament | undefined {
    return this.match?.tournament as Tournament | undefined;
  }

  get tournamentName(): string | undefined {
    return this.tournament?.name;
  }

  get tournamentHasAttachments(): boolean {
    return !!(this.tournament?.attachments?.length);
  }

  get sportLabel(): string {
    const sport = this.tournament?.sport ?? this.match?.sport;
    if (sport === SportEnum.RUGBY) return 'Rugby';
    if (sport === SportEnum.HOCKEY) return 'Hockey';
    return '';
  }

  goToTournament(): void {
    const id = this.tournament?.id;
    if (id) {
      this.router.navigate(['/dashboard/tournaments', id]);
    }
  }

  get titulares(): SquadEntry[] {
    return (this.match?.squad ?? [])
      .filter((e) => e.shirtNumber <= 15)
      .sort((a, b) => a.shirtNumber - b.shirtNumber);
  }

  get suplentes(): SquadEntry[] {
    return (this.match?.squad ?? [])
      .filter((e) => e.shirtNumber > 15)
      .sort((a, b) => a.shirtNumber - b.shirtNumber);
  }

  get playerAttendance(): AttendanceEntry[] {
    return (this.match?.attendance ?? []).filter((a) => !a.isStaff);
  }

  get staffAttendance(): AttendanceEntry[] {
    return (this.match?.attendance ?? []).filter((a) => a.isStaff);
  }

  getAttendanceStatusLabel(status?: AttendanceStatusEnum): string {
    if (status === AttendanceStatusEnum.PRESENT) return 'Presente';
    if (status === AttendanceStatusEnum.ABSENT) return 'Ausente';
    if (status === AttendanceStatusEnum.JUSTIFIED) return 'Justificado';
    return '—';
  }

  getStatusLabel(status: MatchStatusEnum): string {
    return this.matchesService.getStatusLabel(status);
  }

  getCategoryLabel(category?: CategoryEnum): string {
    return getCatLabel(category);
  }

  getPositionLabel(entry: SquadEntry): string {
    return entry.player?.positions?.length
      ? entry.player.positions.map((p) => this.playersService.getPositionLabel(p)).join(', ')
      : '—';
  }

  manageSquad(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'squad']);
  }

  downloadSquadPdf(): void {
    if (this.match) {
      this.squadPdf.generate(this.match, this.match.squad ?? []);
    }
  }

  manageAttendance(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'attendance']);
  }

  isImage(att: MatchAttachment): boolean {
    return att.mimeType.startsWith('image/');
  }

  getAttachmentUrl(fileId: string): string {
    return this.matchesService.getAttachmentUrl(this.match!.id!, fileId);
  }

  openUploadDialog(): void {
    const ref = this.dialog.open(UploadAttachmentDialogComponent, { width: '400px' });
    ref.afterClosed().subscribe((result: UploadAttachmentResult | undefined) => {
      if (!result) return;
      this.uploadingAttachment = true;
      this.matchesService.uploadAttachment(this.match!.id!, result.file, result.name).subscribe({
        next: (att) => {
          (this.match as any).attachments = [...(this.match!.attachments ?? []), att];
          this.uploadingAttachment = false;
          this.snackBar.open('Archivo adjuntado', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this.uploadingAttachment = false;
          this.snackBar.open('Error al subir el archivo', 'Cerrar', { duration: 4000 });
        },
      });
    });
  }

  openVideoDialog(video?: VideoClip): void {
    const allSquad = [...this.titulares, ...this.suplentes];
    const ref = this.dialog.open(VideoDialogComponent, {
      width: '480px',
      data: { squad: allSquad, video } satisfies VideoDialogData,
    });
    ref.afterClosed().subscribe((result: VideoDialogResult | undefined) => {
      if (!result) return;
      const matchId = this.match!.id!;
      if (video?.videoId) {
        this.matchesService.updateVideo(matchId, video.videoId, result).subscribe({
          next: (updated) => {
            (this.match as any).videos = (this.match!.videos ?? []).map((v) =>
              v.videoId === video.videoId ? { ...v, ...updated } : v
            );
            this.snackBar.open('Video actualizado', 'Cerrar', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error al actualizar el video', 'Cerrar', { duration: 4000 }),
        });
      } else {
        this.matchesService.addVideo(matchId, result).subscribe({
          next: (added) => {
            (this.match as any).videos = [...(this.match!.videos ?? []), added];
            this.snackBar.open('Video agregado', 'Cerrar', { duration: 3000 });
          },
          error: () => this.snackBar.open('Error al agregar el video', 'Cerrar', { duration: 4000 }),
        });
      }
    });
  }

  deleteVideo(videoId: string): void {
    this.matchesService.deleteVideo(this.match!.id!, videoId).subscribe({
      next: () => {
        (this.match as any).videos = (this.match!.videos ?? []).filter((v) => v.videoId !== videoId);
        this.snackBar.open('Video eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => this.snackBar.open('Error al eliminar el video', 'Cerrar', { duration: 4000 }),
    });
  }

  getVisibilityLabel(video: VideoClip): string {
    if (video.visibility === 'staff') return 'Solo staff';
    if (video.visibility === 'players') return 'Jugadores específicos';
    return 'Todos';
  }

  deleteAttachment(fileId: string): void {
    this.matchesService.deleteAttachment(this.match!.id!, fileId).subscribe({
      next: () => {
        (this.match as any).attachments = this.match!.attachments!.filter((a) => a.fileId !== fileId);
        this.snackBar.open('Archivo eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al eliminar el archivo', 'Cerrar', { duration: 4000 });
      },
    });
  }

  edit(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'edit']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/matches']);
  }
}
