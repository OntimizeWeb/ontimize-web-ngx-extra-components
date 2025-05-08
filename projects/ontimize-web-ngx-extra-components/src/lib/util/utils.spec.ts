import { TestBed, inject } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { Utils } from './utils';
import { Constants } from './constants';

@Component({
  template: ''
})
class MockComponent {}

describe('Utils', () => {
  let dialog: MatDialog;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['updateSize']);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      declarations: [
        MockComponent
      ]
    });

    dialog = TestBed.inject(MatDialog);
  });

  describe('setFullscreenDialog', () => {
    it('should set dialog to fullscreen when fullscreen is false', () => {
      Utils.setFullscreenDialog(false, dialogRefSpy);
      expect(dialogRefSpy.updateSize).toHaveBeenCalledWith('100%', '100%');
    });

    it('should set dialog to default size when fullscreen is true', () => {
      Utils.setFullscreenDialog(true, dialogRefSpy);
      expect(dialogRefSpy.updateSize).toHaveBeenCalledWith(
        Constants.DEFAULT_WIDTH_DIALOG, 
        Constants.DEFAULT_HEIGHT_DIALOG
      );
    });
  });

  describe('cloneObject', () => {
    it('should create a deep copy of an object', () => {
      const original = { 
        name: 'test', 
        nested: { value: 42 },
        array: [1, 2, 3] 
      };
      
      const clone = Utils.cloneObject(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.nested).not.toBe(original.nested);
      expect(clone.array).not.toBe(original.array);
    });
  });

  describe('openModalVisor', () => {
    it('should open dialog with correct configuration', () => {
      const dialogSpy = spyOn(dialog, 'open').and.returnValue({} as any);
      const testData = { test: 'data' };
      
      Utils.openModalVisor(dialog, MockComponent, testData);
      
      expect(dialogSpy).toHaveBeenCalledWith(MockComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: Constants.DEFAULT_HEIGHT_DIALOG,
        width: Constants.DEFAULT_WIDTH_DIALOG,
        panelClass: ['o-dialog-class', 'o-table-dialog', 'o-extra-components-dialog'],
        data: testData
      });
    });
  });
});