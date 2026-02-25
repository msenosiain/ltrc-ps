import { Document } from 'mongoose';

export class TournamentEntity extends Document {
  id: string;
  name: string;
  season?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
