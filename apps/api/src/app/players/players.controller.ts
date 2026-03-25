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
import { UpdatePlayerDto } from './dto/update-player.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';
import { User } from '../users/schemas/user.schema';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Query() pagination: PaginationDto<PlayerFiltersDto>,
    @Req() req: Request
  ) {
    return this.playersService.findPaginated(pagination, (req as any).user);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(@UploadedFile() file: MulterFile) {
    return this.playersService.importFromFile(file.buffer);
  }

  @Post('update-from-survey')
  @UseInterceptors(FileInterceptor('file'))
  async updateFromSurvey(@UploadedFile() file: MulterFile) {
    return this.playersService.updateFromSurvey(file.buffer);
  }

  // ⚠️ Debe estar ANTES de GET :id para que rutas con prefijo no sean interpretadas como un ID
  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Param('userId') userId: string) {
    return this.playersService.findByUserId(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyPlayer(@Req() req: Request) {
    const user = (req as any).user as User;
    const userId = (user as any)._id?.toString();
    const player = await this.playersService.findByUserId(userId);
    if (!player) throw new NotFoundException('No player linked to this user');
    return player;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@Body() dto: UpdateMyProfileDto, @Req() req: Request) {
    const user = (req as any).user as User;
    const userId = (user as any)._id?.toString();
    return this.playersService.updateSelf(userId, dto);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreatePlayerDto,
    @UploadedFile() photo?: MulterFile,
    @Req() req?: Request
  ) {
    return this.playersService.create(dto, photo, (req as any)?.user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerDto,
    @UploadedFile() photo?: MulterFile,
    @Req() req?: Request
  ) {
    return this.playersService.update(id, dto, photo, (req as any)?.user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req: Request) {
    return this.playersService.getStats((req as any).user);
  }

  @Get('field-options')
  async getFieldOptions() {
    return this.playersService.getFieldOptions();
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

  @Patch(':id/availability')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.KINE, RoleEnum.TRAINER, RoleEnum.COACH)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateAvailability(@Param('id') id: string, @Body() dto: any) {
    return this.playersService.updateAvailability(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.playersService.delete(id);
  }
}
