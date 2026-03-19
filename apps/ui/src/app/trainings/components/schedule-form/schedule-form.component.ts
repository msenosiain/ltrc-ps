import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { SportEnum, TrainingSchedule } from '@ltrc-ps/shared-api-model';
import {
  dayOfWeekOptions,
  getCategoryOptionsBySport,
} from '../../training-options';
import { CategoryOption } from '../../../common/category-options';
import { SportOption } from '../../../common/sport-options';
import {
  buildCreateScheduleForm,
  buildTimeSlotGroup,
  getTimeSlotsArray,
} from '../../forms/schedule-form.factory';
import { ScheduleFormValue } from '../../forms/schedule-form.types';
import { timeStringToDate } from '../../forms/schedule-form.mapper';
import {
  FilterContext,
  UserFilterContextService,
} from '../../../common/services/user-filter-context.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'ltrc-schedule-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTimepickerModule,
  ],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss',
})
export class ScheduleFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly userFilterContext = inject(UserFilterContextService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() schedule?: TrainingSchedule;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<ScheduleFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly dayOptions = dayOfWeekOptions;

  sportOptions: SportOption[] = [];
  showSportField = true;
  categoryOptions: CategoryOption[] = [];
  showCategoryField = true;
  scheduleForm: FormGroup = buildCreateScheduleForm(this.fb);

  private filterCtx?: FilterContext;

  get isHockey(): boolean {
    return this.scheduleForm.get('sport')?.value === SportEnum.HOCKEY;
  }

  get timeSlotsArray(): FormArray {
    return getTimeSlotsArray(this.scheduleForm);
  }

  getStartTimeControl(index: number): FormControl {
    return (this.timeSlotsArray.at(index) as FormGroup).get('startTime') as FormControl;
  }

  getEndTimeControl(index: number): FormControl {
    return (this.timeSlotsArray.at(index) as FormGroup).get('endTime') as FormControl;
  }

  ngOnInit(): void {
    // Apply user filter context: limit options and pre-fill forced values
    this.userFilterContext.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => this.applyFilterContext(ctx));

    this.scheduleForm
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport: SportEnum | null) => {
        this.updateCategoryOptions(sport);
      });
  }

  private applyFilterContext(ctx: FilterContext): void {
    this.filterCtx = ctx;
    this.sportOptions = ctx.sportOptions;
    this.showSportField = ctx.showSportFilter;
    this.showCategoryField = ctx.showCategoryFilter;

    // Pre-fill forced values only when creating (not editing)
    if (!this.schedule) {
      const patch: Record<string, unknown> = {};
      if (ctx.forcedSport) patch['sport'] = ctx.forcedSport;
      if (ctx.forcedCategory) patch['category'] = ctx.forcedCategory;
      if (Object.keys(patch).length) {
        this.scheduleForm.patchValue(patch);
      }
    }

    // Init category options from current form sport value
    this.updateCategoryOptions(this.scheduleForm.get('sport')?.value);
  }

  private updateCategoryOptions(sport: SportEnum | null): void {
    const allOptions = getCategoryOptionsBySport(sport);
    if (this.filterCtx && this.filterCtx.categoryOptions.length > 0) {
      const allowed = new Set(this.filterCtx.categoryOptions.map((c) => c.id));
      this.categoryOptions = allOptions.filter((o) => allowed.has(o.id));
    } else {
      this.categoryOptions = allOptions;
    }
    const cat = this.scheduleForm.get('category')?.value;
    if (cat && !this.categoryOptions.find((c) => c.id === cat)) {
      this.scheduleForm.get('category')?.setValue(null);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule'] && this.schedule) {
      this.categoryOptions = getCategoryOptionsBySport(
        this.schedule.sport ?? null
      );

      // Clear existing timeSlots and rebuild
      while (this.timeSlotsArray.length) {
        this.timeSlotsArray.removeAt(0);
      }
      for (const slot of this.schedule.timeSlots) {
        const group = buildTimeSlotGroup(this.fb);
        group.patchValue({
          day: slot.day,
          startTime: timeStringToDate(slot.startTime),
          endTime: timeStringToDate(slot.endTime),
          location: slot.location ?? '',
        });
        this.timeSlotsArray.push(group);
      }

      this.scheduleForm.patchValue({
        sport: this.schedule.sport,
        category: this.schedule.category,
        division: this.schedule.division ?? '',
        isActive: this.schedule.isActive,
        validFrom: this.schedule.validFrom
          ? new Date(this.schedule.validFrom)
          : null,
        validUntil: this.schedule.validUntil
          ? new Date(this.schedule.validUntil)
          : null,
      });
    }
  }

  addTimeSlot(): void {
    this.timeSlotsArray.push(buildTimeSlotGroup(this.fb));
  }

  removeTimeSlot(index: number): void {
    this.timeSlotsArray.removeAt(index);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) return;
    this.formSubmit.emit(this.scheduleForm.getRawValue() as ScheduleFormValue);
  }
}
