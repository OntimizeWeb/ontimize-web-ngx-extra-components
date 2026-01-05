import { NgModule } from '@angular/core';
import { OEXTRACOMPONENTS_DECLARATION_MODULES, OEXTRACOMPONENTS_IMPORTS_MODULES } from './config/o-components';

import { ODataViewComponent } from './components';
import { ODataViewGridItemDirective } from './components/o-data-view/o-data-view-grid-item.directive';
import { ODataViewTableColumnsDirective } from './components/o-data-view/o-data-view-table-columns.directive';
@NgModule({
  declarations: [...OEXTRACOMPONENTS_DECLARATION_MODULES, ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  imports: [...OEXTRACOMPONENTS_IMPORTS_MODULES],
  providers: [],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective]
})

export class OExtraComponentsModule { }
