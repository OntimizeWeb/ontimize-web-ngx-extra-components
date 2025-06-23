import { Component } from '@angular/core';

export const O_IMAGE_EDITOR_INPUTS: string[] = [
  /* * The image to be edited, can be a URL,blob or a base64 string.*/
  'image',
  /** cropper-options[OImageEditorOptions]: Extends the CropperOptions from ngx-image-cropper and adds additional customization options.*/
  'cropperOptions:cropper-options'
];
export const O_IMAGE_EDITOR_OUTPUTS: string[] = [
  'onImageCropped',
  'OnImageLoaded',
  'onCropperReady',
  'onLoadImageFailed',
  'onImageChanged'
];

@Component({
  selector: 'o-o-image-editor',
  templateUrl: './o-image-editor.component.html',
  styleUrls: ['./o-image-editor.component.scss'],
  inputs: O_IMAGE_EDITOR_INPUTS,
  outputs: O_IMAGE_EDITOR_OUTPUTS
})
export class OImageEditorComponent {

}
