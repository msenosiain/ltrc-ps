import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';
import { Request, Response } from 'express';

import { MatchesService } from './matches.service';
import { PaginationDto } from '../shared/pagination.dto';
import { MatchFiltersDto } from './match-filter.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateMatchSquadDto } from './dto/update-players.dto';
import { RecordMatchAttendanceDto } from './dto/record-match-attendance.dto';
import { ManageVideoDto } from './dto/manage-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Query() pagination: PaginationDto<MatchFiltersDto>,
    @Req() req: Request
  ) {
    return this.matchesService.findPaginated(pagination, (req as any).user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateMatchDto, @Req() req: Request) {
    return this.matchesService.create(dto, (req as any).user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateMatchDto, @Req() req: Request) {
    return this.matchesService.update(id, dto, (req as any).user);
  }

  @Patch(':id/squad')
  async updateSquad(@Param('id') id: string, @Body() dto: UpdateMatchSquadDto) {
    return this.matchesService.updateSquad(id, dto.squad);
  }

  @Patch(':id/attendance')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COACH, RoleEnum.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async recordAttendance(
    @Param('id') id: string,
    @Body() dto: RecordMatchAttendanceDto,
    @Req() req: Request
  ) {
    return this.matchesService.recordAttendance(id, dto, (req as any).user.id);
  }

  @Post(':id/squad/from/:squadId')
  async applySquadTemplate(
    @Param('id') id: string,
    @Param('squadId') squadId: string
  ) {
    return this.matchesService.applySquadTemplate(id, squadId);
  }

  @Get('my-squad')
  @UseGuards(JwtAuthGuard)
  async getMySquadMatches(@Query() pagination: PaginationDto<MatchFiltersDto>, @Req() req: Request) {
    const user = (req as any).user;
    const player = await this.matchesService.findPlayerByUserId((user as any)._id?.toString());
    if (!player) return { items: [], total: 0, page: pagination.page ?? 1, size: pagination.size ?? 10 };
    const filters = { ...(pagination.filters ?? {}), playerId: (player as any)._id?.toString() };
    return this.matchesService.findPaginated({ ...pagination, filters }, (req as any).user);
  }

  @Get('field-options')
  @UseGuards(JwtAuthGuard)
  async getFieldOptions(@Req() req: Request) {
    return this.matchesService.getFieldOptions((req as any).user);
  }

  @Post(':id/attachments')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAttachment(@Param('id') id: string, @UploadedFile() file: MulterFile, @Body('name') name?: string) {
    return this.matchesService.addAttachment(id, file, name);
  }

  @Get(':id/attachments/:fileId')
  async getAttachment(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Res() res: Response
  ) {
    const { stream, mimeType } = await this.matchesService.getAttachmentStream(id, fileId);
    res.setHeader('Content-Type', mimeType);
    stream.pipe(res);
  }

  @Delete(':id/attachments/:fileId')
  @UseGuards(JwtAuthGuard)
  async deleteAttachment(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.matchesService.deleteAttachment(id, fileId);
  }

  @Post(':id/videos')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.ANALYST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addVideo(@Param('id') id: string, @Body() dto: ManageVideoDto) {
    return this.matchesService.addVideo(id, dto);
  }

  @Patch(':id/videos/:videoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.ANALYST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateVideo(@Param('id') id: string, @Param('videoId') videoId: string, @Body() dto: ManageVideoDto) {
    return this.matchesService.updateVideo(id, videoId, dto);
  }

  @Delete(':id/videos/:videoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.ANALYST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteVideo(@Param('id') id: string, @Param('videoId') videoId: string) {
    return this.matchesService.deleteVideo(id, videoId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Req() req: Request) {
    return this.matchesService.findOne(id, (req as any).user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.matchesService.delete(id);
  }
}
