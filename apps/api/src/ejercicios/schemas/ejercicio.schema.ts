import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ejercicio extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ required: true })
  categoriaId: string;

  @Prop({ required: true })
  subcategoriaId: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ type: [String], default: null })
  divisionIds: string[] | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const EjercicioSchema = SchemaFactory.createForClass(Ejercicio);
EjercicioSchema.index({ categoriaId: 1 });
EjercicioSchema.index({ divisionIds: 1 });
