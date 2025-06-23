import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { OImageEditorComponent } from './o-image-editor.component';



@NgModule({
  declarations: [OImageEditorComponent],
  imports: [
    CommonModule,
    ImageCropperModule
  ],
  exports: [OImageEditorComponent]
})
export class OImageEditorModule { }
