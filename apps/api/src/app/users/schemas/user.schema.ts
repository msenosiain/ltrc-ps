import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryEnum, HockeyBranchEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

@Schema()
export class User extends Document {
  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ type: [String], enum: Role, default: [] })
  roles!: Role[];

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
