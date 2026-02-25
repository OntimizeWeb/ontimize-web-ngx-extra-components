import { OTranslateService } from 'ontimize-web-ngx';
import { MAP } from '../i18n/i18n';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateExtraComponentsService {
  private currentLang = 'en';
  private loadedLangs = new Set<string>();

  constructor(private oTranslate: OTranslateService) {
    this.loadTranslations();

    this.oTranslate.onLanguageChanged.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations(): void {
    const lang = this.oTranslate.getCurrentLang() || 'en';
    this.currentLang = lang;

    if (this.loadedLangs.has(lang)) return;

    const dict = MAP[lang] ?? MAP['en'];
    if (dict) {
      this.oTranslate.getNgxTranslateService().setTranslation(lang, dict, true);
      this.loadedLangs.add(lang);
    }
  }

  public get(key: string, values: any[] = []): string {
    this.loadTranslations();

    const translated = this.oTranslate.get(key, values);

    if (translated && translated !== key) return translated;

    const dict = MAP[this.currentLang] ?? MAP['en'];
    return (dict && dict[key]) ? dict[key] : key;
  }
}
