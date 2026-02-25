import { Document } from 'mongoose';

export interface Tournament extends Document {
  readonly id?: string;
  readonly name: string;
  readonly season?: string;
  readonly description?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
