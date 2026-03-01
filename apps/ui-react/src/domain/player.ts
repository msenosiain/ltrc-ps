// Tipo puro Player — sin dependencias de Mongoose
// Corresponde a la interfaz Player de @ltrc-ps/shared-api-model

export enum PlayerPositionEnum {
  LOOSE_HEAD_PROP = 'Loose-head prop',
  HOOKER = 'Hooker',
  TIGHT_HEAD_PROP = 'Tight-head prop',
  LEFT_SECOND_ROW = 'Left Second-row',
  RIGHT_SECOND_ROW = 'Right Second-row',
  BLINDSIDE_FLANKER = 'Blindside flanker',
  OPEN_SIDE_FLANKER = 'Open side flanker',
  NUMBER_8 = 'Number 8',
  SCRUM_HALF = 'Scrum-half',
  FLY_HALF = 'Fly-half',
  LEFT_WING = 'Left wing',
  INSIDE_CENTRE = 'Inside centre',
  OUTSIDE_CENTRE = 'Outside centre',
  RIGHT_WING = 'Right wing',
  FULLBACK = 'Full-back',
}

export enum ClothingSizesEnum {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
}

export interface Address {
  street?: string;
  number?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
}

export interface ClothingSizes {
  jersey?: ClothingSizesEnum;
  shorts?: ClothingSizesEnum;
  sweater?: ClothingSizesEnum;
  pants?: ClothingSizesEnum;
}

export interface Player {
  _id: string;
  idNumber: string;
  lastName: string;
  firstName: string;
  nickName?: string;
  birthDate?: string;
  email: string;
  address?: Address;
  position: PlayerPositionEnum;
  alternatePosition?: PlayerPositionEnum;
  height?: number;
  weight?: number;
  clothingSizes?: ClothingSizes;
  photoId?: string;
  divisionId?: string;
  equipoIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerFilters {
  searchTerm?: string;
  position?: PlayerPositionEnum;
}

export interface PlayersQueryParams {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: PlayerFilters;
}

export interface PaginatedPlayers {
  items: Player[];
  total: number;
  page: number;
  size: number;
}

export type CreatePlayerData = Omit<Player, '_id' | 'createdAt' | 'updatedAt' | 'photoId'>;
export type UpdatePlayerData = Partial<CreatePlayerData>;
