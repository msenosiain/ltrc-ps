import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { BranchAssignmentsService } from './branch-assignments.service';
import { CreateBranchAssignmentDto } from './dto/create-branch-assignment.dto';
import { UpdateBranchAssignmentDto } from './dto/update-branch-assignment.dto';
import { BranchAssignmentFilterDto } from './dto/branch-assignment-filter.dto';

import type { File as MulterFile } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleEnum } from '@ltrc-campo/shared-api-model';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branch-assignments')
export class BranchAssignmentsController {
  constructor(private readonly service: BranchAssignmentsService) {}

  @Get()
  async findAll(@Query() filters: BranchAssignmentFilterDto) {
    return this.service.findAll(filters);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH)
  async create(@Body() dto: CreateBranchAssignmentDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id;
    return this.service.create(dto, userId);
  }

  @Post('import')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH)
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(
    @UploadedFile() file: MulterFile,
    @Body('season') seasonStr: string,
    @Req() req: Request
  ) {
    const season = Number(seasonStr) || new Date().getFullYear();
    const userId = (req as any)?.user?.id;
    return this.service.importFromFile(file.buffer, season, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchAssignmentDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH)
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
