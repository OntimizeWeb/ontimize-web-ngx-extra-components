import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OButtonToggleModule, OGridModule, OTableModule } from 'ontimize-web-ngx';
import { ODataViewGridItemDirective } from './o-data-view-grid-item.directive';
import { ODataViewTableColumnsDirective } from './o-data-view-table-columns.directive';
import { ODataViewComponent } from './o-data-view.component';




@NgModule({
  declarations: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  imports: [
    CommonModule, OTableModule, OGridModule, OButtonToggleModule
  ]
})
export class ODataViewModule { }
