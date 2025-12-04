import * as mongoose from 'mongoose';
import { PlayerPositionEnum } from '../interfaces/player-position.enum';
import { Address, ClothingSizes, Player } from '../interfaces/player.interface';
import { ClothingSizesEnum } from '../interfaces/clothing-sizes.enum';

const AddressSchema = new mongoose.Schema<Address>(
  {
    street: { type: String },
    number: { type: String },
    city: { type: String },
    province: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

const ClothingSizesSchema = new mongoose.Schema<ClothingSizes>(
  {
    jersey: { type: String, enum: Object.values(ClothingSizesEnum) },
    shorts: { type: String, enum: Object.values(ClothingSizesEnum) },
    sweater: { type: String, enum: Object.values(ClothingSizesEnum) },
    pants: { type: String, enum: Object.values(ClothingSizesEnum) },
  },
  { _id: false }
);

export const PlayerSchema = new mongoose.Schema<Player>({
  idNumber: String,
  lastName: String,
  firstName: String,
  birthDate: Date,
  email: String,
  address: { type: AddressSchema },
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
  clothingSizes: { type: ClothingSizesSchema },
});
