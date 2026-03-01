import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { DivisionesModule } from '../divisiones/divisiones.module';
import { EquiposModule } from '../equipos/equipos.module';
import { EjerciciosModule } from '../ejercicios/ejercicios.module';

@Module({
  imports: [UsersModule, DivisionesModule, EquiposModule, EjerciciosModule],
  providers: [SeedService],
})
export class SeedModule {}
