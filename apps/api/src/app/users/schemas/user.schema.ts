import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  HockeyBranchEnum,
  RoleEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

@Schema()
export class User extends Document {
  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  memberNumber?: string;

  @Prop({ unique: true, sparse: true })
  idNumber?: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ required: false, select: false })
  resetPasswordToken?: string;

  @Prop({ required: false })
  resetPasswordExpires?: Date;

  @Prop({ type: [String], enum: RoleEnum, default: [] })
  roles!: RoleEnum[];

  @Prop({ type: [String], enum: SportEnum, default: [] })
  sports?: SportEnum[];

  @Prop({ type: [String], enum: CategoryEnum, default: [] })
  categories?: CategoryEnum[];

  @Prop({ type: [String], enum: HockeyBranchEnum, default: [] })
  branches?: HockeyBranchEnum[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
