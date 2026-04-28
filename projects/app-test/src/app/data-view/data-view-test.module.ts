import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { O_TABLE_GLOBAL_CONFIG, OntimizeWebModule } from 'ontimize-web-ngx';

import { DataViewTestComponent } from './data-view-test.component';
import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';
import { PacksService } from '../../services/packs.service';


@NgModule({
  imports: [
    CommonModule,
    OntimizeWebModule,
    OExtraComponentsModule
  ],
  declarations: [
    DataViewTestComponent
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
      rowHeight: 'small',
      selectionOnRowClick: 'no'
    }
  }
  ]
})
export class DataViewTestModule { }
