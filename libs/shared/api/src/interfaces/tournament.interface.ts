import { Document } from 'mongoose';
import { SportEnum } from '../enums';

export interface Tournament extends Document {
  readonly id?: string;
  readonly name: string;
  readonly season?: string;
  readonly description?: string;
  readonly sport?: SportEnum;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
