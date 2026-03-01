import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Subcategoria {
  id: string;
  label: string;
}

@Schema({ timestamps: true })
export class EjercicioCategoria extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: [{ id: String, label: String }], default: [] })
  subcategorias: Subcategoria[];
}

export const EjercicioCategoriaSchema = SchemaFactory.createForClass(EjercicioCategoria);
