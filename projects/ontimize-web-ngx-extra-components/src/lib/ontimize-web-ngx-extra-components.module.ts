import { NgModule } from '@angular/core';
import { OEXTRACOMPONENTS_DECLARATION_MODULES, OEXTRACOMPONENTS_IMPORTS_MODULES } from './config/o-components';

import { ODataViewComponent } from './components';
import { ODataViewGridItemDirective } from './components/o-data-view/o-data-view-grid-item.directive';
import { ODataViewListItemDirective } from './components/o-data-view/o-data-view-list-item.directive';
import { ApplyDefinedTableInputsDirective } from './components/o-data-view/apply-defined-table-inputs.directive';
import { ApplyDefinedGridInputsDirective } from './components/o-data-view/apply-defined-grid-inputs.directive';
import { ApplyDefinedListInputsDirective } from './components/o-data-view/apply-defined-list-inputs.directive';
@NgModule({
  declarations: [...OEXTRACOMPONENTS_DECLARATION_MODULES, ODataViewComponent, ODataViewGridItemDirective, ODataViewListItemDirective, ApplyDefinedTableInputsDirective,
    ApplyDefinedGridInputsDirective,
    ApplyDefinedListInputsDirective],
  imports: [...OEXTRACOMPONENTS_IMPORTS_MODULES],
  providers: [],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewListItemDirective]
})

export class OExtraComponentsModule { }
