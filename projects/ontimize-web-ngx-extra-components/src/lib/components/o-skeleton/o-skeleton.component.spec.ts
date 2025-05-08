import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OSkeletonComponent } from './o-skeleton.component';
import { OExtraComponentstModule } from '../../ontimize-web-ngx-extra-components.module';

describe('OSkeletonComponent', () => {
  let component: OSkeletonComponent;
  let fixture: ComponentFixture<OSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OExtraComponentstModule,
        NoopAnimationsModule
      ],
      providers: [
        
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});