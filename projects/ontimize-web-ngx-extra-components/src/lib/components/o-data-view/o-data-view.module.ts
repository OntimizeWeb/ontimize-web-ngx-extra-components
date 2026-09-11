import { NgModule } from '@angular/core';
import { ODataViewComponent } from './o-data-view.component';
import { ODataViewGridItemDirective, ODataViewTableColumnsDirective } from '../../directives';

@NgModule({
  imports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective]
})
export class ODataViewModule { }
