import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { PlayerPhotoDialogComponent } from './player-photo-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const dialogRefMock = {
  close: jest.fn(),
} as Partial<MatDialogRef<PlayerPhotoDialogComponent>>;

describe('PlayerPhotoDialogComponent', () => {
  let component: PlayerPhotoDialogComponent;
  let fixture: ComponentFixture<PlayerPhotoDialogComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [PlayerPhotoDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerPhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no file and no preview', () => {
    expect(component.file).toBeUndefined();
    expect(component.previewUrl).toBeNull();
    expect(component.hasCurrentPhoto).toBe(false);
  });

  describe('close()', () => {
    it('should close the dialog without result', () => {
      component.close();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });
  });

  describe('remove()', () => {
    it('should close the dialog with remove action', () => {
      component.remove();
      expect(dialogRefMock.close).toHaveBeenCalledWith({ action: 'remove' });
    });
  });

  describe('confirm()', () => {
    it('should not close if no file is selected', () => {
      component.confirm();
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });

    it('should close with select action when file is set', () => {
      const fakeFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
      component.file = fakeFile;
      component.previewUrl = 'data:image/jpeg;base64,fake';

      component.confirm();

      expect(dialogRefMock.close).toHaveBeenCalledWith({
        action: 'select',
        file: fakeFile,
        previewUrl: 'data:image/jpeg;base64,fake',
      });
    });
  });

  describe('onFileChange()', () => {
    it('should set file and trigger FileReader on valid input', () => {
      const fakeFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const mockReader = {
        onload: null as any,
        result: 'data:image/jpeg;base64,abc',
        readAsDataURL: jest.fn().mockImplementation(function (this: any) {
          this.onload?.();
        }),
      };
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => mockReader);

      const event = { target: { files: [fakeFile] } } as unknown as Event;
      component.onFileChange(event);

      expect(component.file).toBe(fakeFile);
      expect(component.previewUrl).toBe('data:image/jpeg;base64,abc');
    });

    it('should do nothing when no file is selected', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.onFileChange(event);
      expect(component.file).toBeUndefined();
    });
  });
});