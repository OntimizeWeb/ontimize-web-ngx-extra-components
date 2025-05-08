import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { OntimizeWebModule } from 'ontimize-web-ngx';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { OExtraComponentsTranslatePipe } from '../util/o-extra-components-translate.pipe';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OSkeletonComponent } from '../components/o-skeleton/o-skeleton.component';


export const OEXTRACOMPONENTS_DECLARATION_MODULES: any = [
  OSkeletonComponent,
  OExtraComponentsTranslatePipe
];
export const OEXTRACOMPONENTS_IMPORTS_MODULES: any = [
  CommonModule,
  OntimizeWebModule,
  NgxExtendedPdfViewerModule,
  NgxSkeletonLoaderModule,
  FlexLayoutModule,
  DragDropModule
]
export const OEXTRACOMPONENTS_EXPORT_MODULES: any = [];
