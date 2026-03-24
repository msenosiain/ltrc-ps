import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseEntity } from './schemas/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFilterDto } from './dto/exercise-filter.dto';
import { ExerciseCategoryEnum, PaginatedResponse } from '@ltrc-campo/shared-api-model';
import { PaginationDto } from '../shared/pagination.dto';

const SEED_EXERCISES = [
  // Piernas
  { name: 'Sentadilla con barra', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps', 'glúteos', 'femoral'], equipment: ['barra'] },
  { name: 'Prensa de piernas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps', 'glúteos'], equipment: ['máquina'] },
  { name: 'Zancadas / Estocadas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps', 'glúteos', 'femoral'], equipment: [] },
  { name: 'Peso muerto rumano', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['femoral', 'glúteos'], equipment: ['barra'] },
  { name: 'Sentadilla búlgara', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps', 'glúteos'], equipment: ['mancuernas'] },
  { name: 'Extensión de piernas en máquina', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps'], equipment: ['máquina'] },
  { name: 'Curl de pierna', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['femoral'], equipment: ['máquina'] },
  { name: 'Sentadilla Goblet', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['cuádriceps', 'glúteos'], equipment: ['mancuerna'] },
  { name: 'Hip Thrust', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['glúteos'], equipment: ['barra'] },
  // Pecho
  { name: 'Press de banca plano', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho'], equipment: ['barra'] },
  { name: 'Press de banca inclinado', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho'], equipment: ['barra'] },
  { name: 'Flexiones de brazos', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho', 'tríceps'], equipment: [] },
  { name: 'Aperturas con mancuernas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho'], equipment: ['mancuernas'] },
  { name: 'Fondos en paralelas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho', 'tríceps'], equipment: ['paralelas'] },
  { name: 'Cruce de poleas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['pecho'], equipment: ['poleas'] },
  // Espalda
  { name: 'Dominadas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales', 'bíceps'], equipment: ['barra fija'] },
  { name: 'Remo con barra', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales', 'trapecios'], equipment: ['barra'] },
  { name: 'Jalón al pecho', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales'], equipment: ['polea'] },
  { name: 'Remo en polea baja', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales', 'trapecios'], equipment: ['polea'] },
  { name: 'Remo con mancuerna a una mano', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales'], equipment: ['mancuerna'] },
  { name: 'Peso muerto convencional', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['dorsales', 'lumbares', 'glúteos', 'femoral'], equipment: ['barra'] },
  { name: 'Hiperextensiones lumbares', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['lumbares'], equipment: [] },
  // Hombros
  { name: 'Press militar', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros'], equipment: ['barra'] },
  { name: 'Press Arnold', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros'], equipment: ['mancuernas'] },
  { name: 'Elevaciones laterales', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros'], equipment: ['mancuernas'] },
  { name: 'Elevaciones frontales', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros'], equipment: ['mancuernas'] },
  { name: 'Pájaros (Elevaciones posteriores)', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros'], equipment: ['mancuernas'] },
  { name: 'Remo al mentón', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['hombros', 'trapecios'], equipment: ['barra'] },
  // Brazos
  { name: 'Curl de bíceps', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['bíceps'], equipment: ['barra', 'mancuernas'] },
  { name: 'Curl martillo', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['bíceps'], equipment: ['mancuernas'] },
  { name: 'Extensión de tríceps en polea', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['tríceps'], equipment: ['polea'] },
  { name: 'Press francés', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['tríceps'], equipment: ['barra'] },
  { name: 'Fondos entre sillas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['tríceps'], equipment: [] },
  // Core
  { name: 'Plancha abdominal', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['core', 'abdominales'], equipment: [] },
  { name: 'Abdominales crunch', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['abdominales'], equipment: [] },
  { name: 'Elevación de piernas', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['abdominales', 'core'], equipment: [] },
  { name: 'Rueda abdominal', category: ExerciseCategoryEnum.STRENGTH, muscleGroups: ['core', 'abdominales'], equipment: ['rueda abdominal'] },
];

@Injectable()
export class ExercisesService implements OnModuleInit {
  constructor(
    @InjectModel(ExerciseEntity.name)
    private readonly exerciseModel: Model<ExerciseEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.exerciseModel.countDocuments();
    if (count === 0) {
      await this.exerciseModel.insertMany(SEED_EXERCISES);
    }
  }

  async findPaginated(pagination: PaginationDto<ExerciseFilterDto>): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;
    const query: Record<string, unknown> = {};

    if (filters.searchTerm) {
      query['name'] = new RegExp(filters.searchTerm, 'i');
    }
    if (filters.category) {
      query['category'] = filters.category;
    }

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { name: 1 };

    const [items, total] = await Promise.all([
      this.exerciseModel.find(query).sort(sort).skip(skip).limit(size).exec(),
      this.exerciseModel.countDocuments(query),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const exercise = await this.exerciseModel.findById(id);
    if (!exercise) throw new NotFoundException('Exercise not found');
    return exercise;
  }

  async create(dto: CreateExerciseDto, callerId?: string) {
    return this.exerciseModel.create({ ...dto, createdBy: callerId, updatedBy: callerId });
  }

  async update(id: string, dto: UpdateExerciseDto, callerId?: string) {
    const exercise = await this.exerciseModel.findById(id);
    if (!exercise) throw new NotFoundException('Exercise not found');
    Object.assign(exercise, dto);
    if (callerId) (exercise as any).updatedBy = callerId;
    return exercise.save();
  }

  async delete(id: string) {
    const exercise = await this.exerciseModel.findById(id);
    if (!exercise) throw new NotFoundException('Exercise not found');
    return exercise.deleteOne();
  }
}
