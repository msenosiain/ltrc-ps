import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Equipo extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  divisionId: string;

  @Prop({ required: true })
  order: number;
}

export const EquipoSchema = SchemaFactory.createForClass(Equipo);
EquipoSchema.index({ divisionId: 1, order: 1 });
