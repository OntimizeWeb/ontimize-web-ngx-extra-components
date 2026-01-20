import { NgModule } from '@angular/core';
import { O_TABLE_GLOBAL_CONFIG, OntimizeWebModule } from 'ontimize-web-ngx';

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
  },
  {
    provide: O_TABLE_GLOBAL_CONFIG,
    useValue: {
      autoAdjust: false,
      autoAlignTitles: false,
      filterColumnActiveByDefault: false,
      detailMode: 'dblclick',
      editionMode: 'click',
      rowHeight: 'small'
    }
  }
  ]
})
export class HomeModule { }
