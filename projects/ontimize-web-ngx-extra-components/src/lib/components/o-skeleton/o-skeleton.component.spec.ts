import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { OSkeletonComponent } from './o-skeleton.component';
@Pipe({ name: 'oExtraComponentsTranslate' })
class MockExtraComponentsTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('OSkeletonComponent', () => {
  let component: OSkeletonComponent;
  let fixture: ComponentFixture<OSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        NgxSkeletonLoaderModule,
        OSkeletonComponent
      ],
      declarations: [
        MockExtraComponentsTranslatePipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
