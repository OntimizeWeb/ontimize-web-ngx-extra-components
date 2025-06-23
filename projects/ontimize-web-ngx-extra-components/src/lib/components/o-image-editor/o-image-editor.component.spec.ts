import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OImageEditorComponent } from './o-image-editor.component';

describe('OImageEditorComponent', () => {
  let component: OImageEditorComponent;
  let fixture: ComponentFixture<OImageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OImageEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OImageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
