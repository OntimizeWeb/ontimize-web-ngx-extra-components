import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { OImageEditorComponent } from './o-image-editor.component';
import { OntimizeWebModule } from 'ontimize-web-ngx';

@NgModule({
  declarations: [OImageEditorComponent],
  imports: [
    CommonModule,
    ImageCropperComponent,
    OntimizeWebModule
  ],
  exports: [OImageEditorComponent]
})
export class OImageEditorModule { }
