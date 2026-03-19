import { Document, PopulatedDoc, Types } from 'mongoose';
import {
  AttendanceEntry,
  CategoryEnum,
  MatchStatusEnum,
  VideoClip,
} from '@ltrc-campo/shared-api-model';
import { TournamentEntity } from '../../tournaments/schemas/tournament.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class MatchEntity extends Document {
  id: string;
  date: Date;
  time?: string;
  opponent?: string;
  venue: string;
  isHome?: boolean;
  status: MatchStatusEnum;
  category: CategoryEnum;
  division?: string;
  tournament: PopulatedDoc<TournamentEntity & Document>;
  squad: {
    shirtNumber: number;
    player: PopulatedDoc<PlayerEntity & Document>;
  }[];
  attendance: AttendanceEntry[];
  videos?: VideoClip[];
  result?: {
    homeScore: number;
    awayScore: number;
  };
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
