import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntimizeWebModule } from 'ontimize-web-ngx';

import { CalendarTestComponent } from './calendar-test.component';
import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';

@NgModule({
  imports: [
    CommonModule,
    OntimizeWebModule,
    OExtraComponentsModule
  ],
  declarations: [
    CalendarTestComponent
  ]
})
export class CalendarTestModule { }
