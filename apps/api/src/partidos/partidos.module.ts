import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';
import { Partido, PartidoSchema } from './schemas/partido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Partido.name, schema: PartidoSchema, collection: 'partidos' }]),
  ],
  controllers: [PartidosController],
  providers: [PartidosService],
  exports: [PartidosService],
})
export class PartidosModule {}
