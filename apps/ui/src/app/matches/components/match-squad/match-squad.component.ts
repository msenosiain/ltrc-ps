import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Player, Squad, SquadEntry } from '@ltrc-ps/shared-api-model';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { PlayersService } from '../../../players/services/players.service';
import { MatchesService } from '../../services/matches.service';
import { SquadsService } from '../../services/squads.service';

@Component({
  selector: 'ltrc-match-squad',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressBarModule,
  ],
  templateUrl: './match-squad.component.html',
  styleUrl: './match-squad.component.scss',
})
export class MatchSquadComponent implements OnInit {
  @Input() matchId!: string;
  @Input() initialSquad: SquadEntry[] = [];

  private readonly matchesService = inject(MatchesService);
  private readonly playersService = inject(PlayersService);
  private readonly squadsService = inject(SquadsService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  squadRows: SquadEntry[] = [];
  isDirty = false;
  saving = false;
  squads: Squad[] = [];

  selectedSquadIdCtrl = new FormControl<string | null>(null);

  addForm = this.fb.group({
    playerSearch: [null as Player | string | null],
    shirtNumber: [null as number | null, [Validators.min(1), Validators.max(26)]],
  });

  playerSuggestions: Player[] = [];
  selectedPlayer: Player | null = null;

  private readonly searchSubject = new Subject<string>();

  readonly displayPlayerFn = (player: Player | null): string => {
    if (!player) return '';
    return `${player.lastName}, ${player.firstName}`;
  };

  readonly displayedColumns = ['shirtNumber', 'player', 'position', 'actions'];

  ngOnInit(): void {
    this.squadRows = [...this.initialSquad];

    this.squadsService
      .getSquads()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((squads) => (this.squads = squads));

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          this.playersService.getPlayers({ page: 1, size: 20, filters: { searchTerm: term } })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => (this.playerSuggestions = result.items));

    this.addForm
      .get('playerSearch')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (typeof value === 'string') {
          this.searchSubject.next(value);
        }
      });
  }

  onPlayerSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedPlayer = event.option.value as Player;
  }

  addPlayer(): void {
    const shirtNumber = this.addForm.value.shirtNumber;
    if (!this.selectedPlayer || !shirtNumber) return;

    this.squadRows = [...this.squadRows, { shirtNumber, player: this.selectedPlayer }];
    this.isDirty = true;
    this.selectedPlayer = null;
    this.addForm.reset();
    this.playerSuggestions = [];
  }

  removePlayer(index: number): void {
    this.squadRows = this.squadRows.filter((_, i) => i !== index);
    this.isDirty = true;
  }

  saveSquad(): void {
    this.saving = true;
    const squad = this.squadRows.map((entry) => ({
      shirtNumber: entry.shirtNumber,
      playerId: entry.player.id!,
    }));

    this.matchesService
      .updateSquad(this.matchId, squad)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (match) => {
          this.squadRows = [...match.squad];
          this.isDirty = false;
          this.saving = false;
        },
        error: () => (this.saving = false),
      });
  }

  applyTemplate(): void {
    const squadId = this.selectedSquadIdCtrl.value;
    if (!squadId) return;

    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Aplicar plantilla',
          message: '¿Confirmar? Esto reemplazará el plantel actual.',
          confirmLabel: 'Aplicar',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => {
          this.saving = true;
          return this.matchesService.applySquadFromTemplate(this.matchId, squadId);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (match) => {
          this.squadRows = [...match.squad];
          this.isDirty = false;
          this.saving = false;
          this.selectedSquadIdCtrl.reset();
        },
        error: () => (this.saving = false),
      });
  }

  getPositionLabel(player: Player): string {
    return this.playersService.getPositionLabel(player.position);
  }
}
