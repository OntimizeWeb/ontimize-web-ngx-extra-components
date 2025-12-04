import { NgModule } from '@angular/core';
import { OEXTRACOMPONENTS_DECLARATION_MODULES, OEXTRACOMPONENTS_IMPORTS_MODULES } from './config/o-components';

import { ODataViewComponent } from './components';
@NgModule({
  declarations: [...OEXTRACOMPONENTS_DECLARATION_MODULES, ODataViewComponent],
  imports: [...OEXTRACOMPONENTS_IMPORTS_MODULES],
  providers: [],
  exports: [ODataViewComponent]
})

export class OExtraComponentsModule { }
