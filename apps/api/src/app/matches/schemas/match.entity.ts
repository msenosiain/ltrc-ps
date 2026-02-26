import { Document, PopulatedDoc } from 'mongoose';
import { MatchStatusEnum, MatchTypeEnum, VideoClip } from '@ltrc-ps/shared-api-model';
import { TournamentEntity } from '../../tournaments/schemas/tournament.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class MatchEntity extends Document {
  id: string;
  date: Date;
  opponent: string;
  venue: string;
  isHome: boolean;
  status: MatchStatusEnum;
  type: MatchTypeEnum;
  tournament?: PopulatedDoc<TournamentEntity & Document>;
  squad: { shirtNumber: number; player: PopulatedDoc<PlayerEntity & Document> }[];
  videos?: VideoClip[];
  result?: {
    homeScore: number;
    awayScore: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
