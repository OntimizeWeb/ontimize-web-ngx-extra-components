import { Pipe, PipeTransform, Injector } from '@angular/core';
import { OTranslateService } from 'ontimize-web-ngx';
import * as CORE_TRANSLATIONS from '../i18n/i18n';

@Pipe({
  name: 'oExtraComponentsTranslate',
  pure: false
})
export class OExtraComponentsTranslatePipe implements PipeTransform {

  constructor(private translateService: OTranslateService) { }

  transform(text: string): string {
    const lang = this.translateService.getCurrentLang();
    const bundle = CORE_TRANSLATIONS.MAP[lang];

    if (bundle && Object.prototype.hasOwnProperty.call(bundle, text)) {
      return bundle[text];
    }

    return this.translateService.get(text);
  }

}
