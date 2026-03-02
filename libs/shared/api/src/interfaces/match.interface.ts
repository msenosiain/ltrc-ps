import { Document } from 'mongoose';
import { CategoryEnum, MatchStatusEnum, MatchTypeEnum, SportEnum } from '../enums';
import { Player } from './player.interface';
import { Tournament } from './tournament.interface';

export interface MatchResult {
  homeScore: number;
  awayScore: number;
}

export interface VideoClip {
  url: string;
  name: string;
  description?: string;
  /** Si está vacío o ausente, el video es visible para todos los jugadores del partido */
  targetPlayers?: Player[];
}

export interface SquadEntry {
  shirtNumber: number;
  player: Player;
}

export interface Match extends Document {
  readonly id?: string;
  readonly date: Date;
  readonly time?: string;
  readonly opponent: string;
  readonly venue: string;
  readonly isHome: boolean;
  readonly status: MatchStatusEnum;
  readonly type: MatchTypeEnum;
  readonly sport?: SportEnum;
  readonly category?: CategoryEnum;
  readonly division?: string;
  readonly tournament?: Tournament;
  readonly squad: SquadEntry[];
  readonly videos?: VideoClip[];
  readonly result?: MatchResult;
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
