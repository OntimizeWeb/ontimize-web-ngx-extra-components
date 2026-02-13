import { NgModule } from '@angular/core';
import { OEXTRACOMPONENTS_DECLARATION_MODULES, OEXTRACOMPONENTS_EXPORT_MODULES, OEXTRACOMPONENTS_IMPORTS_MODULES, OEXTRACOMPONENTS_PROVIDERS } from './config/o-components';
import { TranslateExtraComponentsService } from './services';

@NgModule({
  declarations: [...OEXTRACOMPONENTS_DECLARATION_MODULES],
  imports: [...OEXTRACOMPONENTS_IMPORTS_MODULES],
  providers: [...OEXTRACOMPONENTS_PROVIDERS],
  exports: [...OEXTRACOMPONENTS_EXPORT_MODULES]
})

export class OExtraComponentsModule {

  constructor(private readonly translationService: TranslateExtraComponentsService) {
    this.translationService.loadTranslations();
  }
}
