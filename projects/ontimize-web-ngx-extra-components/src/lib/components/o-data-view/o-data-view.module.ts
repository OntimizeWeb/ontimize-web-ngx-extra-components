import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OButtonToggleModule, OGridModule, OTableModule } from 'ontimize-web-ngx';
import { ODataViewComponent } from './o-data-view.component';
import { ODataViewGridItemDirective, ODataViewTableColumnsDirective } from '../../directives';

@NgModule({
  declarations: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  exports: [ODataViewComponent, ODataViewGridItemDirective, ODataViewTableColumnsDirective],
  imports: [
    CommonModule, OTableModule, OGridModule, OButtonToggleModule
  ]
})
export class ODataViewModule { }
