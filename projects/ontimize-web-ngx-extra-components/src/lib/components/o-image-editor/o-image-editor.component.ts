import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { base64ToFile, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { DialogService, ODialogConfig } from 'ontimize-web-ngx';
import { take } from 'rxjs';

type OImageEditorTool = 'crop' | 'resize' | 'upload';

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
  rotationDeg = 0;
  cropAdjustMode: 'rotation' | 'scale' = 'rotation';

  scalePercent = 0;
  minScale = 1;
  maxScale = 3;
  uploadMode = false;

  resizeWidth: number | null = null;
  resizeHeight: number | null = null;

  private naturalWidth: number | null = null;
  private naturalHeight: number | null = null;


  constructor(private dialogService: DialogService){}

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

    if (tool === 'resize') {
      this.syncResizeInputsFromCurrent();
    }
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
    this.resizeWidth = null;
    this.resizeHeight = null;
    this.naturalWidth = null;
    this.naturalHeight = null;
  }

  onImageCropped(e: ImageCroppedEvent): void {
    this.lastCropped = e;
    this.syncResizeInputsFromCurrent();
  }

  onImageLoaded(img?: any): void {
    this.cropperLoading = false;
    const w = img?.original?.size?.width ?? img?.width;
    const h = img?.original?.size?.height ?? img?.height;

    if (typeof w === 'number' && typeof h === 'number') {
      this.naturalWidth = w;
      this.naturalHeight = h;
    }

    this.syncResizeInputsFromCurrent();
  }

  private syncResizeInputsFromCurrent(): void {
    // prioridad: tamaño del último crop (si existe)
    const w = this.lastCropped?.width ?? this.naturalWidth;
    const h = this.lastCropped?.height ?? this.naturalHeight;

    if (!w || !h) return;

    // solo inicializa si están vacíos (para no pisar lo que el usuario edita)
    if (this.resizeWidth == null) this.resizeWidth = w;
    if (this.resizeHeight == null) this.resizeHeight = h;
  }

  onLoadImageFailed(): void {
    this.cropperLoading = false;
    console.error('[o-image-editor] loadImageFailed');
  }

  async save(): Promise<void> {
    const blob = this.getCroppedBlob();
    if (!blob) {
      this.dialogService.warn('Guardar', 'No hay imagen recortada para guardar.');
      return;
    }

    const suggestedName = this.buildSuggestedFileName(blob.type || 'image/png');

    const saved = await this.persistBlobToDisk(blob, suggestedName);
    if (!saved) {
      // El usuario canceló el guardado (o hubo AbortError)
      return;
    }

    this.askLoadNewOrContinue();
  }

  private getCroppedBlob(): Blob | null {
    // 1) Preferible: si ngx-image-cropper te entrega blob
    const fromBlob = this.lastCropped?.blob;
    if (fromBlob instanceof Blob) return fromBlob;

    // 2) Alternativa: convertir desde base64
    const b64 = this.lastCropped?.base64;
    if (typeof b64 === 'string' && b64.length) {
      return base64ToFile(b64); // devuelve Blob
    }

    return null;
  }

  private buildSuggestedFileName(mime: string): string {
    const ext =
      mime.includes('jpeg') ? 'jpg' :
        mime.includes('png') ? 'png' :
          mime.includes('webp') ? 'webp' : 'png';

    // Si tienes el nombre original, úsalo aquí
    return `image-edited.${ext}`;
  }

  /**
   * Devuelve true si se guardó; false si se canceló.
   * - Usa showSaveFilePicker cuando existe (elige ruta).
   * - Si no existe, descarga (el usuario elige según su navegador).
   */
  private async persistBlobToDisk(blob: Blob, suggestedName: string): Promise<boolean> {
    const w = window as any;

    // File System Access API (Chrome/Edge/Opera)
    if (typeof w.showSaveFilePicker === 'function') {
      try {
        const handle = await w.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: 'Image',
              accept: { [blob.type || 'image/png']: ['.png', '.jpg', '.jpeg', '.webp'] }
            }
          ]
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (e: any) {
        // AbortError = usuario canceló
        if (e?.name === 'AbortError') return false;
        this.dialogService.error('Guardar', 'No se pudo guardar la imagen.');
        return false;
      }
    }

    // Fallback universal: descarga
    this.downloadBlob(blob, suggestedName);
    return true;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private askLoadNewOrContinue(): void {
    const config: ODialogConfig = {
      icon: 'save',
      okButtonText: 'Cargar nueva',
      cancelButtonText: 'Seguir editando'
    };

    this.dialogService.confirm(
      'Imagen guardada',
      '¿Quieres cargar una imagen nueva o seguir editando esta?',
      config
    );

    this.dialogService.dialogRef.afterClosed().pipe(take(1)).subscribe((loadNew: boolean) => {
      if (loadNew) {
        this.resetEditorState();
        this.selectedFile = null;
      }
    });
  }

  reset(): void {
    this.resetEditorState();
  }

}
