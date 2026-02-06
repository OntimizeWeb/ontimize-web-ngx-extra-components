import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';

type OImageEditorTool = 'crop' | 'resize' | 'upload';

@Component({
  selector: 'o-image-editor',
  templateUrl: './o-image-editor.component.html',
  styleUrls: ['./o-image-editor.component.scss'],
})
export class OImageEditorComponent {

  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('uploadDialogTpl', { static: true }) uploadDialogTpl!: TemplateRef<any>;

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
  rotationDeg = 0;
  cropAdjustMode: 'rotation' | 'scale' = 'rotation';

  scalePercent = 0;
  minScale = 1;
  maxScale = 3;
  uploadMode = false;

  startReplaceImage(): void {
    this.uploadMode = true;
    this.dragOver = false;
  }

  cancelReplaceImage(): void {
    this.uploadMode = false;
    this.dragOver = false;
  }

  private normalizeDeg(v: number): number {
    while (v > 180) v -= 360;
    while (v < -180) v += 360;
    return v;
  }

  private applyRotation(deg: number): void {
    this.canvasRotation = 0;
    this.rotationDeg = this.normalizeDeg(deg);
    this.transform = { ...this.transform, rotate: this.rotationDeg };
  }

  private applyScalePercent(p: number): void {
    const pct = Math.min(100, Math.max(0, Math.round(p)));
    this.scalePercent = pct;

    const scale = this.minScale + (this.maxScale - this.minScale) * (pct / 100);
    this.transform = { ...this.transform, scale: Number(scale.toFixed(3)) };
  }

  rotate(): void {
    this.canvasRotation = (this.canvasRotation + 1) % 4;
  }

  /** Slider input */
  onAdjustInput(raw: string): void {
    const v = Number(raw);

    if (this.cropAdjustMode === 'rotation') {
      this.applyRotation(v);
    } else {
      this.applyScalePercent(v);
    }
  }

  /** Props del slider según modo */
  get adjustMin(): number {
    return this.cropAdjustMode === 'rotation' ? -180 : 0;
  }
  get adjustMax(): number {
    return this.cropAdjustMode === 'rotation' ? 180 : 100;
  }
  get adjustStep(): number {
    return 1;
  }
  get adjustValue(): number {
    return this.cropAdjustMode === 'rotation' ? this.rotationDeg : this.scalePercent;
  }
  get adjustPercent(): number {
    if (this.cropAdjustMode === 'scale') {
      return 50 + (this.scalePercent / 100) * 50;
    }
    return ((this.rotationDeg + 180) / 360) * 100;
  }
  get adjustLabel(): string {
    return this.cropAdjustMode === 'rotation'
      ? `${this.rotationDeg}°`
      : `${this.scalePercent}%`;
  }

  flip(): void {
    this.transform = { ...this.transform, flipH: !this.transform.flipH };
  }

  setCropRatio(ratio: number | null): void {
    if (ratio == null) {
      this.aspectRatio = null;
      this.maintainAspectRatio = false;
    } else {
      this.aspectRatio = ratio;
      this.maintainAspectRatio = true;
    }
  }

  isRatioSelected(ratio: number | null): boolean {
    if (ratio == null) {
      return !this.maintainAspectRatio;
    }
    if (!this.maintainAspectRatio || this.aspectRatio == null) return false;

    const EPS = 0.0001;
    return Math.abs(this.aspectRatio - ratio) < EPS;
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
    this.uploadMode = false;
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
    this.uploadMode = false;
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
    this.rotationDeg = 0;
    this.scalePercent = 0;
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
