import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export class BranchAssignmentEntity extends Document {
  id: string;
  player: Types.ObjectId;
  branch: HockeyBranchEnum;
  category: CategoryEnum;
  season: number;
  sport: SportEnum;
  assignedBy?: Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
