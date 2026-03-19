import { IsOptional, IsString } from 'class-validator';

export class MoveParticipantDto {
  /** ID del TripTransport destino. null = quitar asignación. */
  @IsOptional()
  @IsString()
  readonly transportId?: string | null;
}
