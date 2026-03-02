import { Document } from 'mongoose';
import { CategoryEnum, SportEnum } from '@ltrc-ps/shared-api-model';

export class TournamentEntity extends Document {
  id: string;
  name: string;
  season?: string;
  description?: string;
  sport?: SportEnum;
  categories?: CategoryEnum[];
  createdAt: Date;
  updatedAt: Date;
}
