import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OSkeletonComponent } from '../components/o-skeleton/o-skeleton.component';
import { OntimizeWebModule } from 'ontimize-web-ngx';
import { ODataViewModule } from '../components/o-data-view/o-data-view.module';
import { OImageEditorModule } from '../components';
import { TranslateExtraComponentsService } from '../services';

export const OEXTRACOMPONENTS_DECLARATION_MODULES: any = [
  OSkeletonComponent
];
export const OEXTRACOMPONENTS_IMPORTS_MODULES: any = [
  CommonModule,
  NgxSkeletonLoaderModule,
  FlexLayoutModule,
  OntimizeWebModule
];
export const OEXTRACOMPONENTS_PROVIDERS: any = [
  TranslateExtraComponentsService
];
export const OEXTRACOMPONENTS_EXPORT_MODULES: any = [
  ODataViewModule,
  OImageEditorModule
];
