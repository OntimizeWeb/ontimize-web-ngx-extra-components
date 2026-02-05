import { NgModule } from '@angular/core';
import { OntimizeWebModule } from 'ontimize-web-ngx';
import { ImageEditorTestComponent } from './image-editor-test.component';
import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';

@NgModule({
  imports: [
    OntimizeWebModule,
    OExtraComponentsModule
  ],
  declarations: [
    ImageEditorTestComponent
  ]
})
export class ImageEditorTestModule { }
