import { OTranslateService } from 'ontimize-web-ngx';
import { MAP } from '../i18n/i18n';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateExtraComponentsService {
  protected oTranslateService: OTranslateService;
  protected currentLang: string = 'en';

  private static initialized = false;
  constructor(
    public translate: OTranslateService
  ) {
    this.translate.onLanguageChanged.subscribe((event: Event) => {
      TranslateExtraComponentsService.initialized = false;
      this.loadTranslations();
    });
  }

  loadTranslations() {
    if (!TranslateExtraComponentsService.initialized) {
      const lang = this.translate.getCurrentLang();
      this.translate.getNgxTranslateService().setTranslation(lang, MAP[lang], true); // `true` => merge
      TranslateExtraComponentsService.initialized = true;
    }
  }

  public get(text: string): string {
    let textTranslated;
    try {
      if (this.oTranslateService) {
        const bundle = this.oTranslateService.get(text);
        if (bundle && bundle['value']) {
          textTranslated = bundle['value'];
        }
        textTranslated = textTranslated === text ? undefined : textTranslated;
      }
    } catch (e) {
      textTranslated = undefined;
    }
    if (!textTranslated) {
      const bundle = MAP[this.currentLang];
      if (bundle && bundle[text]) {
        textTranslated = bundle[text];
      } else {
        textTranslated = text;
      }
    }
    return textTranslated;
  }

}
