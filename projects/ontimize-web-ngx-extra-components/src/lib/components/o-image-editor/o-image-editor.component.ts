import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

type OImageEditorTool = 'crop' | 'transform' | 'adjust' | 'resize';

@Component({
  selector: 'o-image-editor',
  templateUrl: './o-image-editor.component.html',
  styleUrls: ['./o-image-editor.component.scss'],
})
export class OImageEditorComponent {

  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  activeTool: OImageEditorTool = 'crop';
  activeIndex = 0;
  selectedFile: File | null = null;
  dragOver = false;
  cropperLoading = false;
  maintainAspectRatio = false;
  aspectRatio: number | null = null;
  canvasRotation = 0;
  transform: ImageTransform = { scale: 1, rotate: 0, flipH: false, flipV: false };
  lastCropped?: ImageCroppedEvent;

  rotate(): void {
    this.canvasRotation = (this.canvasRotation + 1) % 4;
  }

  flip(): void {
    this.transform = { ...this.transform, flipH: !this.transform.flipH };
  }

  setCropRatio(ratio: number | null): void {
    this.aspectRatio = ratio;
    this.maintainAspectRatio = ratio !== null;
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  setTool(tool: OImageEditorTool): void {
    this.activeTool = tool;
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.loadFile(file);
    input.value = '';
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = false;
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = false;

    const file = ev.dataTransfer?.files?.[0] ?? null;
    if (!file) return;

    this.loadFile(file);
  }

  select(index: number): void {
    this.activeIndex = index;
  }

  private loadFile(file: File): void {
    if (!file.type?.startsWith('image/')) {
      console.warn('[o-image-editor] Not an image:', file.type);
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) {
      console.warn('[o-image-editor] Unsupported type:', file.type);
      return;
    }

    this.resetEditorState();

    this.selectedFile = file;
    this.cropperLoading = true;
  }

  private resetEditorState(): void {
    this.lastCropped = undefined;
    this.canvasRotation = 0;
    this.transform = { scale: 1, rotate: 0, flipH: false, flipV: false };
    this.aspectRatio = null;
    this.maintainAspectRatio = false;
  }

  onImageCropped(e: ImageCroppedEvent): void {
    this.lastCropped = e;
  }

  onImageLoaded(): void {
    this.cropperLoading = false;
  }

  onLoadImageFailed(): void {
    this.cropperLoading = false;
    console.error('[o-image-editor] loadImageFailed');
  }
  save(): void {
    console.log('save');
  }

  reset(): void {
    this.resetEditorState();
  }

}
