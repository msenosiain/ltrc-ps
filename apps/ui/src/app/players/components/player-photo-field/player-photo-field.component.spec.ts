import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PlayerPhotoFieldComponent } from './player-photo-field.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

const dialogRefMock = {
  componentInstance: { hasCurrentPhoto: false, previewUrl: null },
  afterClosed: jest.fn(),
};

const matDialogMock = {
  open: jest.fn().mockReturnValue(dialogRefMock),
} as Partial<MatDialog>;

describe('PlayerPhotoFieldComponent', () => {
  let component: PlayerPhotoFieldComponent;
  let fixture: ComponentFixture<PlayerPhotoFieldComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    dialogRefMock.afterClosed.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [PlayerPhotoFieldComponent, NoopAnimationsModule],
    })
      .overrideProvider(MatDialog, { useValue: matDialogMock })
      .compileComponents();

    fixture = TestBed.createComponent(PlayerPhotoFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showError', () => {
    it('should be false when not touched', () => {
      component.required = true;
      component.value = null;
      expect(component.showError).toBe(false);
    });

    it('should be true when touched, required, and no value', () => {
      component.required = true;
      component.value = null;
      component['touched'] = true;
      expect(component.showError).toBe(true);
    });

    it('should be false when touched and required but has value', () => {
      component.required = true;
      component.value = { previewUrl: 'data:image/jpeg;base64,x' };
      component['touched'] = true;
      expect(component.showError).toBe(false);
    });
  });

  describe('validate()', () => {
    it('should return { required: true } when required and no value', () => {
      component.required = true;
      component.value = null;
      expect(component.validate()).toEqual({ required: true });
    });

    it('should return null when required and has value', () => {
      component.required = true;
      component.value = { previewUrl: 'data:image/jpeg;base64,x' };
      expect(component.validate()).toBeNull();
    });

    it('should return null when not required', () => {
      component.required = false;
      component.value = null;
      expect(component.validate()).toBeNull();
    });
  });

  describe('writeValue()', () => {
    it('should set value', () => {
      const val = { previewUrl: 'data:image/jpeg;base64,x' };
      component.writeValue(val);
      expect(component.value).toEqual(val);
    });

    it('should set null when undefined is passed', () => {
      component.writeValue(null);
      expect(component.value).toBeNull();
    });
  });

  describe('setDisabledState()', () => {
    it('should update disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });
  });

  describe('openDialog()', () => {
    it('should not open dialog when disabled', () => {
      component.disabled = true;
      component.openDialog();
      expect(matDialogMock.open).not.toHaveBeenCalled();
    });

    it('should open dialog when not disabled', () => {
      component.openDialog();
      expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should set value and call onChange on select result', () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      const selectResult = { action: 'select', file: new File([''], 'p.jpg'), previewUrl: 'data:url' };
      dialogRefMock.afterClosed.mockReturnValueOnce(of(selectResult));

      component.openDialog();

      expect(component.value).toEqual({ file: selectResult.file, previewUrl: 'data:url' });
      expect(onChange).toHaveBeenCalledWith(component.value);
    });

    it('should clear value and call onChange on remove result', () => {
      const onChange = jest.fn();
      component.value = { previewUrl: 'data:url' };
      component.registerOnChange(onChange);
      dialogRefMock.afterClosed.mockReturnValueOnce(of({ action: 'remove' }));

      component.openDialog();

      expect(component.value).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should pass existing photo state to dialog instance', () => {
      component.value = { previewUrl: 'data:existing' };
      component.openDialog();

      expect(dialogRefMock.componentInstance.hasCurrentPhoto).toBe(true);
      expect(dialogRefMock.componentInstance.previewUrl).toBe('data:existing');
    });
  });
});