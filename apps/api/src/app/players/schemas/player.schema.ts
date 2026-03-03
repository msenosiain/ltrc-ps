import { Schema, Types } from 'mongoose';
import { PlayerEntity } from './player.entity';
import {
  CategoryEnum,
  ClothingSizesEnum,
  HockeyPositions,
  RugbyPositions,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

const allPositionValues = [
  ...new Set([
    ...Object.values(RugbyPositions),
    ...Object.values(HockeyPositions),
  ]),
];

const AddressSchema = new Schema(
  {
    street: String,
    number: String,
    floorApartment: String,
    neighborhood: String,
    city: String,
    postalCode: String,
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

const MedicalDataSchema = new Schema(
  {
    height: Number,
    weight: Number,
    torgIndex: Number,
    healthInsurance: String,
  },
  { _id: false }
);

export const PlayerSchema = new Schema<PlayerEntity>(
  {
    idNumber: { type: String, unique: true, index: true },
    lastName: String,
    firstName: String,
    secondName: String,
    nickName: String,
    birthDate: Date,
    email: { type: String, unique: true, index: true },
    address: AddressSchema,
    sport: {
      type: String,
      enum: Object.values(SportEnum),
    },
    category: {
      type: String,
      enum: Object.values(CategoryEnum),
    },
    position: {
      type: String,
      enum: allPositionValues,
    },
    alternatePosition: {
      type: String,
      enum: allPositionValues,
    },
    clothingSizes: ClothingSizesSchema,
    medicalData: MedicalDataSchema,
    photoId: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'players',
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
