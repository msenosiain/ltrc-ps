import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Partido } from './schemas/partido.schema';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { PaginationDto, PaginatedResult } from '../shared/pagination-result.dto';

@Injectable()
export class PartidosService {
  constructor(@InjectModel(Partido.name) private readonly partidoModel: Model<Partido>) {}

  async findAll(
    pagination: PaginationDto,
    filters: { divisionId?: string; equipoId?: string; fecha?: string },
  ): Promise<PaginatedResult<Partido>> {
    const { page = 1, limit = 20 } = pagination;
    const query: Record<string, any> = {};

    if (filters.divisionId) query.divisionId = filters.divisionId;
    if (filters.equipoId) query.equipoId = filters.equipoId;
    if (filters.fecha) {
      const start = new Date(filters.fecha);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.fecha);
      end.setHours(23, 59, 59, 999);
      query.fecha = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.partidoModel.find(query).sort({ fecha: -1 }).skip(skip).limit(limit).lean(),
      this.partidoModel.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const partido = await this.partidoModel.findById(id).lean();
    if (!partido) throw new NotFoundException('Partido no encontrado');
    return partido;
  }

  async create(dto: CreatePartidoDto, userId: string) {
    const partido = new this.partidoModel({
      ...dto,
      fecha: new Date(dto.fecha),
      createdBy: new Types.ObjectId(userId),
    });
    return partido.save();
  }

  async update(id: string, dto: Partial<CreatePartidoDto>) {
    const partido = await this.partidoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!partido) throw new NotFoundException('Partido no encontrado');
    return partido;
  }

  async remove(id: string) {
    const partido = await this.partidoModel.findByIdAndDelete(id).lean();
    if (!partido) throw new NotFoundException('Partido no encontrado');
    return { deleted: true };
  }
}
