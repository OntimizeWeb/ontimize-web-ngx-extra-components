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
    // Carga inicial
    this.loadTranslations();

    // Recarga cuando cambia el idioma
    this.oTranslate.onLanguageChanged.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations(): void {
    const lang = this.oTranslate.getCurrentLang() || 'en';
    this.currentLang = lang;

    // Evita setTranslation repetido por idioma (opcional)
    if (this.loadedLangs.has(lang)) return;

    const dict = MAP[lang] ?? MAP['en'];
    if (dict) {
      this.oTranslate.getNgxTranslateService().setTranslation(lang, dict, true); // merge
      this.loadedLangs.add(lang);
    }
  }

  public get(key: string, values: any[] = []): string {
    // Asegura que el diccionario de ese idioma está cargado
    this.loadTranslations();

    // OTranslateService.get devuelve string (no bundle)
    const translated = this.oTranslate.get(key, values);

    // Si no existe, OTranslateService suele devolver la key tal cual
    if (translated && translated !== key) return translated;

    // Fallback a tu MAP (ya con currentLang actualizado)
    const dict = MAP[this.currentLang] ?? MAP['en'];
    return (dict && dict[key]) ? dict[key] : key;
  }
}
