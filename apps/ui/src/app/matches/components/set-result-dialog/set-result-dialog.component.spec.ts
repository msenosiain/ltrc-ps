import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  SetResultDialogComponent,
  SetResultDialogData,
  SetResultDialogResult,
} from './set-result-dialog.component';
import { Match } from '@ltrc-campo/shared-api-model';

const dialogRefMock = {
  close: jest.fn(),
} as Partial<MatDialogRef<SetResultDialogComponent>>;

const makeDialogData = (result?: { homeScore: number; awayScore: number }): SetResultDialogData => ({
  match: { id: 'match-1', opponent: 'Rival FC', result } as unknown as Match,
});

describe('SetResultDialogComponent', () => {
  let component: SetResultDialogComponent;
  let fixture: ComponentFixture<SetResultDialogComponent>;

  const setupWithData = async (data: SetResultDialogData) => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SetResultDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('when match has no existing result', () => {
    beforeEach(async () => {
      await setupWithData(makeDialogData());
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with null values when no result', () => {
      expect(component.form.value.homeScore).toBeNull();
      expect(component.form.value.awayScore).toBeNull();
    });

    it('form should be invalid when scores are null', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('save() should do nothing when form is invalid', () => {
      component.save();
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('when match has an existing result', () => {
    beforeEach(async () => {
      await setupWithData(makeDialogData({ homeScore: 3, awayScore: 1 }));
    });

    it('should initialize form with existing result values', () => {
      expect(component.form.value.homeScore).toBe(3);
      expect(component.form.value.awayScore).toBe(1);
    });

    it('form should be valid when scores are pre-filled', () => {
      expect(component.form.valid).toBe(true);
    });

    it('save() should close dialog with result when form is valid', () => {
      component.save();
      expect(dialogRefMock.close).toHaveBeenCalledWith({
        homeScore: 3,
        awayScore: 1,
      } as SetResultDialogResult);
    });
  });

  describe('when valid scores are entered', () => {
    beforeEach(async () => {
      await setupWithData(makeDialogData());
    });

    it('save() should close dialog with entered result', () => {
      component.form.setValue({ homeScore: 2, awayScore: 0 });
      component.save();
      expect(dialogRefMock.close).toHaveBeenCalledWith({
        homeScore: 2,
        awayScore: 0,
      } as SetResultDialogResult);
    });
  });

  describe('cancel / close with null', () => {
    beforeEach(async () => {
      await setupWithData(makeDialogData());
    });

    it('dialogRef.close() with no args simulates cancel', () => {
      component.dialogRef.close(null as any);
      expect(dialogRefMock.close).toHaveBeenCalledWith(null);
    });
  });
});
