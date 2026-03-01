import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Division } from './schemas/division.schema';

export class CreateDivisionDto {
  id: string;
  name: string;
  order: number;
}

@Injectable()
export class DivisionesService {
  constructor(@InjectModel(Division.name) private readonly divisionModel: Model<Division>) {}

  findAll() {
    return this.divisionModel.find().sort({ order: 1 }).lean();
  }

  async findOne(id: string) {
    const div = await this.divisionModel.findOne({ id }).lean();
    if (!div) throw new NotFoundException('División no encontrada');
    return div;
  }

  async create(dto: CreateDivisionDto) {
    const div = new this.divisionModel(dto);
    return div.save();
  }

  async upsert(dto: CreateDivisionDto) {
    return this.divisionModel.findOneAndUpdate(
      { id: dto.id },
      dto,
      { upsert: true, new: true },
    ).lean();
  }

  async update(id: string, dto: Partial<CreateDivisionDto>) {
    const div = await this.divisionModel.findOneAndUpdate({ id }, dto, { new: true }).lean();
    if (!div) throw new NotFoundException('División no encontrada');
    return div;
  }

  async remove(id: string) {
    const div = await this.divisionModel.findOneAndDelete({ id }).lean();
    if (!div) throw new NotFoundException('División no encontrada');
    return { deleted: true };
  }
}
