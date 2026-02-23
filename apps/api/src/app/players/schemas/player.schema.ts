import { Schema, Types } from 'mongoose';
import { PlayerEntity } from './player.entity';
import {
  ClothingSizesEnum,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';

const AddressSchema = new Schema(
  {
    street: String,
    number: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

const ClothingSizesSchema = new Schema(
  {
    jersey: { type: String, enum: Object.values(ClothingSizesEnum) },
    shorts: { type: String, enum: Object.values(ClothingSizesEnum) },
    sweater: { type: String, enum: Object.values(ClothingSizesEnum) },
    pants: { type: String, enum: Object.values(ClothingSizesEnum) },
  },
  { _id: false }
);

export const PlayerSchema = new Schema<PlayerEntity>(
  {
    idNumber: String,
    lastName: String,
    firstName: String,
    nickName: String,
    birthDate: Date,
    email: String,
    address: AddressSchema,
    position: {
      type: String,
      enum: Object.values(PlayerPositionEnum),
    },
    alternatePosition: {
      type: String,
      enum: Object.values(PlayerPositionEnum),
    },
    size: Number,
    weight: Number,
    clothingSizes: ClothingSizesSchema,
    photoId: { type: String },
  },
  {
    timestamps: true,
    collection: 'players'
  }
);

PlayerSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

PlayerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
