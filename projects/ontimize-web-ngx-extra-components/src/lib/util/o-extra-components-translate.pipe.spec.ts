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

  it('should get translation from local bundle when available', () => {
    // Setup
    const mockLang = 'en';
    const mockKey = 'TEST_KEY';
    const mockTranslation = 'Test translation';
    
    // Create a mock MAP with our test data
    const mockMap = {
      'en': {
        'TEST_KEY': 'Test translation'
      },
      'es': {
        'TEST_KEY': 'Test traducción'
      }
    };
    
    // Replace the MAP in CORE_TRANSLATIONS with our mock
    spyOnProperty(CORE_TRANSLATIONS, 'MAP').and.returnValue(mockMap);
    
    // Configure the translateService spy
    translateService.getCurrentLang.and.returnValue(mockLang);
    
    // Execute
    const result = pipe.transform(mockKey);
    
    // Verify
    expect(result).toBe(mockTranslation);
    expect(translateService.getCurrentLang).toHaveBeenCalled();
    expect(translateService.get).not.toHaveBeenCalled();
  });

  it('should fallback to translateService.get when translation not in local bundle', () => {
    // Setup
    const mockLang = 'en';
    const mockKey = 'MISSING_KEY';
    const mockTranslation = 'Fallback translation';
    
    // Create a mock MAP without our test key
    const mockMap = {
        'en': {
          'TEST_KEY': 'Test translation'
        },
        'es': {
          'TEST_KEY': 'Test traducción'
        }
      };
    
    // Replace the MAP in CORE_TRANSLATIONS with our mock
    spyOnProperty(CORE_TRANSLATIONS, 'MAP').and.returnValue(mockMap);
    
    // Configure the translateService spy
    translateService.getCurrentLang.and.returnValue(mockLang);
    translateService.get.and.returnValue(mockTranslation);
    
    // Execute
    const result = pipe.transform(mockKey);
    
    // Verify
    expect(result).toBe(mockTranslation);
    expect(translateService.getCurrentLang).toHaveBeenCalled();
    expect(translateService.get).toHaveBeenCalledWith(mockKey);
  });

  it('should fallback to translateService.get when language bundle not available', () => {
    // Setup
    const mockLang = 'fr'; // Assuming 'fr' bundle doesn't exist
    const mockKey = 'TEST_KEY';
    const mockTranslation = 'Fallback translation';
    
    // Create a mock MAP without our test language
    const mockMap = { 'en':{}, 'es':{} };
    
    // Replace the MAP in CORE_TRANSLATIONS with our mock
    spyOnProperty(CORE_TRANSLATIONS, 'MAP').and.returnValue(mockMap);
    
    // Configure the translateService spy
    translateService.getCurrentLang.and.returnValue(mockLang);
    translateService.get.and.returnValue(mockTranslation);
    
    // Execute
    const result = pipe.transform(mockKey);
    
    // Verify
    expect(result).toBe(mockTranslation);
    expect(translateService.getCurrentLang).toHaveBeenCalled();
    expect(translateService.get).toHaveBeenCalledWith(mockKey);
  });
});