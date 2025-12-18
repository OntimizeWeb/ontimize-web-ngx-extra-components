import { NgModule } from '@angular/core';
import { OntimizeWebModule } from 'ontimize-web-ngx';

import { HomeComponent } from './home.component';
import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';
import { PacksService } from '../../services/packs.service';


@NgModule({
  imports: [
    OntimizeWebModule,
    OExtraComponentsModule
  ],
  declarations: [
    HomeComponent
  ],
  providers: [{
    provide: 'packs',
    useValue: PacksService
  }]
})
export class HomeModule { }
