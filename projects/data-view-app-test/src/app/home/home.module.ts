import { NgModule } from '@angular/core';
import { OntimizeWebModule } from 'ontimize-web-ngx';

import { HomeComponent } from './home.component';
import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';


@NgModule({
  imports: [
    OntimizeWebModule,
    OExtraComponentsModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }
