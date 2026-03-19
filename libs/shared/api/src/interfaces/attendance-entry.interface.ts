import { AttendanceStatusEnum } from '../enums';
import { Player } from './player.interface';

export interface AttendanceEntry {
  player?: Player; // for players
  user?: string; // userId — for coaches/PFs/staff
  userName?: string; // display name for staff
  isStaff: boolean; // true = coach/PF/staff, false = player
  confirmed: boolean;
  confirmedAt?: Date;
  status?: AttendanceStatusEnum;
  markedAt?: Date;
  markedBy?: string; // userId who marked attendance
}
