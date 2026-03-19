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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import type { File as MulterFile } from 'multer';

import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentFilterDto } from './dto/tournament-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../shared/pagination.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: PaginationDto<TournamentFilterDto>,
    @Req() req: Request
  ) {
    return this.tournamentsService.findPaginated(query, (req as any).user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateTournamentDto, @Req() req: Request) {
    return this.tournamentsService.create(dto, (req as any).user);
  }

  // --- Attachments (before :id to avoid route conflicts) ---

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile
  ) {
    return this.tournamentsService.addAttachment(id, file);
  }

  @Get(':id/attachments/:attachmentId')
  async downloadAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response
  ) {
    const { stream, filename, mimetype } =
      await this.tournamentsService.getAttachmentStream(id, attachmentId);
    res.setHeader('Content-Type', mimetype);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    stream.pipe(res);
  }

  @Delete(':id/attachments/:attachmentId')
  async deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string
  ) {
    return this.tournamentsService.removeAttachment(id, attachmentId);
  }

  // --- Single tournament CRUD ---

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTournamentDto, @Req() req: Request) {
    return this.tournamentsService.update(id, dto, (req as any).user);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tournamentsService.delete(id);
  }
}
