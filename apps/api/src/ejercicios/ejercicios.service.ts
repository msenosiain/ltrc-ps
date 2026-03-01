import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ejercicio } from './schemas/ejercicio.schema';
import { EjercicioCategoria } from './schemas/ejercicio-categoria.schema';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { PaginationDto, PaginatedResult } from '../shared/pagination-result.dto';

@Injectable()
export class EjerciciosService {
  constructor(
    @InjectModel(Ejercicio.name) private readonly ejercicioModel: Model<Ejercicio>,
    @InjectModel(EjercicioCategoria.name) private readonly categoriaModel: Model<EjercicioCategoria>,
  ) {}

  // ─── Categorías ────────────────────────────────────────────────────────────

  findAllCategorias() {
    return this.categoriaModel.find().sort({ order: 1 }).lean();
  }

  async findCategoria(id: string) {
    const cat = await this.categoriaModel.findOne({ id }).lean();
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async upsertCategoria(dto: CreateCategoriaDto) {
    return this.categoriaModel.findOneAndUpdate(
      { id: dto.id },
      dto,
      { upsert: true, new: true },
    ).lean();
  }

  async createCategoria(dto: CreateCategoriaDto) {
    const cat = new this.categoriaModel(dto);
    return cat.save();
  }

  // ─── Ejercicios ────────────────────────────────────────────────────────────

  async findAll(
    pagination: PaginationDto,
    filters: { categoriaId?: string; subcategoriaId?: string; divisionId?: string },
  ): Promise<PaginatedResult<Ejercicio>> {
    const { page = 1, limit = 20 } = pagination;
    const query: Record<string, any> = {};

    if (filters.categoriaId) query.categoriaId = filters.categoriaId;
    if (filters.subcategoriaId) query.subcategoriaId = filters.subcategoriaId;
    if (filters.divisionId) {
      query.$or = [{ divisionIds: null }, { divisionIds: filters.divisionId }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.ejercicioModel.find(query).skip(skip).limit(limit).lean(),
      this.ejercicioModel.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const ej = await this.ejercicioModel.findById(id).lean();
    if (!ej) throw new NotFoundException('Ejercicio no encontrado');
    return ej;
  }

  async create(dto: CreateEjercicioDto, userId: string) {
    const ej = new this.ejercicioModel({
      ...dto,
      createdBy: new Types.ObjectId(userId),
    });
    return ej.save();
  }

  async upsertEjercicio(dto: CreateEjercicioDto & { _id?: string }, userId: string) {
    if (dto._id) {
      return this.ejercicioModel.findByIdAndUpdate(dto._id, dto, { new: true }).lean();
    }
    const ej = new this.ejercicioModel({ ...dto, createdBy: new Types.ObjectId(userId) });
    return ej.save();
  }

  async update(id: string, dto: Partial<CreateEjercicioDto>) {
    const ej = await this.ejercicioModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!ej) throw new NotFoundException('Ejercicio no encontrado');
    return ej;
  }

  async remove(id: string) {
    const ej = await this.ejercicioModel.findByIdAndDelete(id).lean();
    if (!ej) throw new NotFoundException('Ejercicio no encontrado');
    return { deleted: true };
  }
}
