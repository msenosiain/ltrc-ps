import { Document } from 'mongoose';
import { CategoryEnum, SportEnum } from '../enums';

export interface Tournament extends Document {
  readonly id?: string;
  readonly name: string;
  readonly season?: string;
  readonly description?: string;
  readonly sport?: SportEnum;
  readonly categories?: CategoryEnum[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
