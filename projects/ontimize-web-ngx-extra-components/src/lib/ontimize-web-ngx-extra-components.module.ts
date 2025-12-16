import { NgModule } from '@angular/core';
import { OEXTRACOMPONENTS_DECLARATION_MODULES, OEXTRACOMPONENTS_IMPORTS_MODULES } from './config/o-components';

import { ODataViewComponent } from './components';
import { ODataViewGridItemDirective } from './components/o-data-view/o-data-view-grid-item.directive';
import { ODataViewListItemDirective } from './components/o-data-view/o-data-view-list-item.directive';
@NgModule({
  declarations: [...OEXTRACOMPONENTS_DECLARATION_MODULES, ODataViewComponent, ODataViewGridItemDirective, ODataViewListItemDirective],
  imports: [...OEXTRACOMPONENTS_IMPORTS_MODULES],
  providers: [],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewListItemDirective]
})

export class OExtraComponentsModule { }
