import { Document } from 'mongoose';
import { SportEnum } from '@ltrc-ps/shared-api-model';

export class TournamentEntity extends Document {
  id: string;
  name: string;
  season?: string;
  description?: string;
  sport?: SportEnum;
  createdAt: Date;
  updatedAt: Date;
}
