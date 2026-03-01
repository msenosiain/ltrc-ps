import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';
import { Equipo, EquipoSchema } from './schemas/equipo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Equipo.name, schema: EquipoSchema, collection: 'equipos' }]),
  ],
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class EquiposModule {}
