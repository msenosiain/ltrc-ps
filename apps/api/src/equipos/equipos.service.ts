import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipo } from './schemas/equipo.schema';

export class CreateEquipoDto {
  id: string;
  name: string;
  divisionId: string;
  order: number;
}

@Injectable()
export class EquiposService {
  constructor(@InjectModel(Equipo.name) private readonly equipoModel: Model<Equipo>) {}

  findAll(divisionId?: string) {
    const filter = divisionId ? { divisionId } : {};
    return this.equipoModel.find(filter).sort({ divisionId: 1, order: 1 }).lean();
  }

  async upsert(dto: CreateEquipoDto) {
    return this.equipoModel.findOneAndUpdate(
      { id: dto.id },
      dto,
      { upsert: true, new: true },
    ).lean();
  }

  async create(dto: CreateEquipoDto) {
    const equipo = new this.equipoModel(dto);
    return equipo.save();
  }

  async update(id: string, dto: Partial<CreateEquipoDto>) {
    const equipo = await this.equipoModel.findOneAndUpdate({ id }, dto, { new: true }).lean();
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }
}
