import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findAll() {
    return this.userModel.find().select('-password').lean();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).lean();
  }

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hash });
    const saved = await user.save();
    const { password: _p, ...rest } = saved.toObject();
    return rest;
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { deleted: true };
  }
}
