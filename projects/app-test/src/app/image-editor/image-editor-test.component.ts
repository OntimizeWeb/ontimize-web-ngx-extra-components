import { Component, OnInit } from '@angular/core';
import { Image } from '../../../../ontimize-web-ngx-extra-components/src/lib/models';

@Component({
  selector: 'image-editor-test',
  templateUrl: './image-editor-test.component.html',
  styleUrls: ['./image-editor-test.component.scss']
})
export class ImageEditorTestComponent {
  images: Image.Image[] = [];

  onSaved(payload: File | Image.NewImage[]) { console.log('SAVE', payload); }
  onDeleted(img: Image.Image) { console.log('DELETE', img); }
  onCancel() { console.log('CANCEL'); }

}
