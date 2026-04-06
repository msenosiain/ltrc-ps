import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { EvaluationsService } from './evaluations.service';
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto';
import { ToggleEvaluationSettingsDto } from './dto/toggle-evaluation-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@ltrc-campo/shared-api-model';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  // ── Settings ────────────────────────────────────────────────────────────────

  @Get('settings')
  async getAllSettings() {
    return this.evaluationsService.getAllSettings();
  }

  @Post('settings')
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER)
  @UseGuards(RolesGuard)
  async toggleSettings(@Body() dto: ToggleEvaluationSettingsDto, @Req() req: Request) {
    return this.evaluationsService.toggleSettings(dto, (req as any).user.id);
  }

  // ── Evaluations ──────────────────────────────────────────────────────────────

  @Get()
  async findByCategory(
    @Query('category') category: string,
    @Query('sport') sport: string,
    @Query('period') period: string,
  ) {
    return this.evaluationsService.findByCategory(category as any, sport as any, period);
  }

  @Get('player/:playerId')
  async findByPlayer(@Param('playerId') playerId: string) {
    return this.evaluationsService.findByPlayer(playerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.COORDINATOR, RoleEnum.MANAGER, RoleEnum.COACH, RoleEnum.TRAINER)
  @UseGuards(RolesGuard)
  async upsert(@Body() dto: UpsertEvaluationDto, @Req() req: Request) {
    return this.evaluationsService.upsert(dto, (req as any).user.id);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string) {
    return this.evaluationsService.delete(id);
  }
}
