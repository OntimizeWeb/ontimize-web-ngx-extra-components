import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OButtonToggleModule, OGridModule, OTableModule } from 'ontimize-web-ngx';
import { ODataViewComponent } from './o-data-view.component';

@NgModule({
  declarations: [ODataViewComponent],
  exports: [ODataViewComponent],
  imports: [
    CommonModule, OTableModule, OGridModule, OButtonToggleModule
  ]
})
export class ODataViewModule { }
