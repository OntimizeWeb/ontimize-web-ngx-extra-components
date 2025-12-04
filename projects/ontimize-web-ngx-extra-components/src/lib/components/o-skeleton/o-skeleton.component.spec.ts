import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OntimizeWebModule, APP_CONFIG, Config } from 'ontimize-web-ngx';

import { OSkeletonComponent } from './o-skeleton.component';
import { OExtraComponentsModule } from '../../ontimize-web-ngx-extra-components.module';

const TEST_CONFIG: Config = {
  apiEndpoint: '',
  uuid: 'test-app',
  title: 'test',
  locale: 'en',
  applicationLocales: ['en']
};

describe('OSkeletonComponent', () => {
  let component: OSkeletonComponent;
  let fixture: ComponentFixture<OSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OExtraComponentsModule,
        NoopAnimationsModule,
        OntimizeWebModule
      ],
      providers: [
        { provide: APP_CONFIG, useValue: TEST_CONFIG }
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