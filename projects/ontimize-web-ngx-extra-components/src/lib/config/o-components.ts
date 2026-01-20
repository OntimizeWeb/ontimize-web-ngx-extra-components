import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { OExtraComponentsTranslatePipe } from '../util/o-extra-components-translate.pipe';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OSkeletonComponent } from '../components/o-skeleton/o-skeleton.component';
import { OntimizeWebModule } from 'ontimize-web-ngx';
import { ODataViewModule } from '../components/o-data-view/o-data-view.module';
import { ODataViewGridItemDirective, ODataViewTableColumnsDirective } from '../directives';

export const OEXTRACOMPONENTS_DECLARATION_MODULES: any = [
  OSkeletonComponent,
  OExtraComponentsTranslatePipe
];
export const OEXTRACOMPONENTS_IMPORTS_MODULES: any = [
  CommonModule,
  NgxSkeletonLoaderModule,
  FlexLayoutModule,
  DragDropModule,
  OntimizeWebModule
]
export const OEXTRACOMPONENTS_EXPORT_MODULES: any = [ODataViewModule];
