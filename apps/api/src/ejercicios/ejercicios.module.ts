import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EjerciciosController } from './ejercicios.controller';
import { EjerciciosService } from './ejercicios.service';
import { Ejercicio, EjercicioSchema } from './schemas/ejercicio.schema';
import { EjercicioCategoria, EjercicioCategoriaSchema } from './schemas/ejercicio-categoria.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ejercicio.name, schema: EjercicioSchema, collection: 'ejercicios' },
      { name: EjercicioCategoria.name, schema: EjercicioCategoriaSchema, collection: 'ejercicio_categorias' },
    ]),
  ],
  controllers: [EjerciciosController],
  providers: [EjerciciosService],
  exports: [EjerciciosService],
})
export class EjerciciosModule {}
