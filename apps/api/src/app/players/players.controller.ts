import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Req,
  NotFoundException,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { Response, Request } from 'express';

import { PlayersService } from './players.service';
import { PaginationDto } from '../shared/pagination.dto';
import { PlayerFiltersDto } from './player-filter.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/schemas/user.schema';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async findPaginated(@Query() pagination: PaginationDto<PlayerFiltersDto>) {
    return this.playersService.findPaginated(pagination);
  }

  // ⚠️ Debe estar ANTES de GET :id para que "me" no sea interpretado como un ID
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPlayer(@Req() req: Request) {
    const user = (req as any).user as User;
    const userId = (user as any)._id?.toString();
    const player = await this.playersService.findByUserId(userId);
    if (!player) throw new NotFoundException('No player linked to this user');
    return player;
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() dto: CreatePlayerDto,
    @UploadedFile() photo?: MulterFile,
  ) {
    return this.playersService.create(dto, photo);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePlayerDto>,
    @UploadedFile() photo?: MulterFile,
  ) {
    return this.playersService.update(id, dto, photo);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Get(':id/photo')
  async getPhoto(@Param('id') id: string, @Res() res: Response) {
    const player = await this.playersService.findOne(id);
    if (!player.photoId) throw new NotFoundException('Player has no photo');

    const stream = await this.playersService.getPhotoStream(player.photoId);
    res.setHeader('Content-Type', 'image/jpeg');
    stream.pipe(res);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.playersService.delete(id);
  }
}
