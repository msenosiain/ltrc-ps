import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchEntity } from '../matches/schemas/match.entity';
import { TrainingSessionEntity } from '../trainings/sessions/schemas/training-session.entity';
import { PlayerEntity } from '../players/schemas/player.entity';
import { CalendarEvent, RoleEnum } from '@ltrc-campo/shared-api-model';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(MatchEntity.name) private readonly matchModel: Model<MatchEntity>,
    @InjectModel(TrainingSessionEntity.name) private readonly sessionModel: Model<TrainingSessionEntity>,
    @InjectModel(PlayerEntity.name) private readonly playerModel: Model<PlayerEntity>,
  ) {}

  async getEvents(fromDate: string, toDate: string, caller?: User, sport?: string, category?: string): Promise<CalendarEvent[]> {
    const callerIdStr = caller ? String((caller as any)._id) : null;
    const isAdmin = caller?.roles.includes(RoleEnum.ADMIN);

    // Look up linked player to use their sport/category when the user account has no scope set
    const callerPlayer = callerIdStr
      ? await this.playerModel.findOne({ userId: callerIdStr }).lean()
      : null;

    const scopeFilter: Record<string, unknown> = {};
    if (caller && !isAdmin) {
      const effectiveSports = caller.sports?.length
        ? caller.sports
        : callerPlayer?.sport ? [(callerPlayer as any).sport] : [];
      const effectiveCategories = caller.categories?.length
        ? caller.categories
        : callerPlayer?.category ? [(callerPlayer as any).category] : [];

      if (effectiveSports.length) scopeFilter['sport'] = { $in: effectiveSports };
      if (effectiveCategories.length) scopeFilter['category'] = { $in: effectiveCategories };
    }
    // Explicit filters narrow the scope further
    if (sport) scopeFilter['sport'] = sport;
    if (category) scopeFilter['category'] = category;

    const fromDateObj = new Date(fromDate + 'T00:00:00.000Z');
    const toDateObj = new Date(toDate + 'T23:59:59.999Z');

    const [matches, sessions] = await Promise.all([
      this.matchModel.find({ date: { $gte: fromDateObj, $lte: toDateObj }, status: { $nin: ['cancelled', 'completed'] }, ...scopeFilter }).populate('tournament').lean(),
      this.sessionModel.find({ date: { $gte: fromDate, $lte: toDate }, status: { $nin: ['cancelled', 'completed'] }, ...scopeFilter }).lean(),
    ]);

    const matchEvents: CalendarEvent[] = (matches as any[]).map((m) => ({
      type: 'match' as const,
      id: m._id.toString(),
      date: (m.date as Date).toISOString(),
      title: m.opponent ? `vs ${m.opponent}` : ((m.tournament as any)?.name || 'Encuentro'),
      sport: m.sport,
      category: m.category,
      status: m.status,
      opponent: m.opponent,
      isHome: m.isHome,
      branch: m.branch,
      division: m.division,
      location: m.venue,
    }));

    const callerPlayerIdStr = callerPlayer ? (callerPlayer as any)._id.toString() : null;

    const trainingEvents: CalendarEvent[] = (sessions as any[]).map((s) => {
      let userConfirmed = false;
      if (callerIdStr && s.attendance?.length) {
        userConfirmed = s.attendance.some((a: any) => {
          if (callerPlayerIdStr && !a.isStaff) {
            return a.player?.toString() === callerPlayerIdStr && a.confirmed;
          }
          return a.isStaff && a.user === callerIdStr && a.confirmed;
        });
      }
      return {
        type: 'training' as const,
        id: s._id.toString(),
        date: `${s.date}T12:00:00`,
        startTime: s.startTime,
        title: 'Entrenamiento',
        sport: s.sport,
        category: s.category,
        status: s.status,
        location: s.location,
        userConfirmed,
      };
    });

    return [...matchEvents, ...trainingEvents].sort((a, b) => {
      const dateCmp = a.date.slice(0, 10).localeCompare(b.date.slice(0, 10));
      if (dateCmp !== 0) return dateCmp;
      const timeA = a.startTime ?? a.date.slice(11, 16);
      const timeB = b.startTime ?? b.date.slice(11, 16);
      return timeA.localeCompare(timeB);
    });
  }
}
