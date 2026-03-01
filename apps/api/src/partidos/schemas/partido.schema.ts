import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Partido extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ required: true })
  divisionId: string;

  @Prop({ required: true })
  equipoId: string;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ default: '' })
  rival: string;

  @Prop({ default: '' })
  resultado: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const PartidoSchema = SchemaFactory.createForClass(Partido);
PartidoSchema.index({ divisionId: 1, fecha: -1 });
PartidoSchema.index({ fecha: -1 });
