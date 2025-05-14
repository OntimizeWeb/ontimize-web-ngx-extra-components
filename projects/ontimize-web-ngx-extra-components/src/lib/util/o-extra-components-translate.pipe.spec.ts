import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { OTranslateService } from 'ontimize-web-ngx';
import { OExtraComponentsTranslatePipe } from './o-extra-components-translate.pipe';
import * as CORE_TRANSLATIONS from '../i18n/i18n';


describe('OExtraComponentsTranslatePipe', () => {
  let pipe: OExtraComponentsTranslatePipe;
  let translateService: jasmine.SpyObj<OTranslateService>;
  
  beforeEach(() => {
    
    // Create a spy for OTranslateService
    const translateSpy = jasmine.createSpyObj('OTranslateService', ['getCurrentLang', 'get']);

    TestBed.configureTestingModule({
      providers: [
        OExtraComponentsTranslatePipe,
        { provide: OTranslateService, useValue: translateSpy },
        Injector
      ]
    });
    
    // Get the injector and mock translateService
    translateService = TestBed.inject(OTranslateService) as jasmine.SpyObj<OTranslateService>;
    const injector = TestBed.inject(Injector);
    
    // Create pipe instance
    pipe = new OExtraComponentsTranslatePipe(injector);
  });

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

});