import { ChangeDetectorRef, Component, ElementRef, Injector, NgZone, ViewChild, ViewEncapsulation } from '@angular/core';
import { base64ToFile, CropperPosition, ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage } from 'ngx-image-cropper';
import { DialogService, ODialogConfig } from 'ontimize-web-ngx';
import { take } from 'rxjs';
import { TranslateExtraComponentsService } from '../../services';

type EditorTool = 'crop' | 'resize';
type ToolsUI = EditorTool | 'upload';
type ResizePreset = 'horizontal' | 'vertical' | 'avatar';
type ResizeRatioPreset = 'custom' | '1:1' | '2:1' | '3:2' | '4:3' | '5:4' | '16:9';

@Component({
  selector: 'o-image-editor',
  templateUrl: './o-image-editor.component.html',
  styleUrls: ['./o-image-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OImageEditorComponent {

  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('cropper') private cropperComp?: ImageCropperComponent;

  activeTool: EditorTool = 'crop';
  uploadOverlay = false;
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
  resizeLocked = false;
  private lockedW: number | null = null;
  private lockedH: number | null = null;
  resizePreset: ResizePreset | null = null;
  resizeRatioPreset: ResizeRatioPreset | null = 'custom';
  roundCropper = false;
  scalePercent = 0;
  minScale = 1;
  maxScale = 3;
  dotsTape = Array.from({ length: 80 });
  private readonly VIEWPORT_W = 135;
  private readonly GAP = 4;
  private readonly SMALL = 4;
  private readonly BIG = 6;
  private readonly INIT_CROPPER: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 10_000_000,
    y2: 10_000_000
  };

  cropperPosition: CropperPosition = { ...this.INIT_CROPPER };

  private cropperIsReady = false;

  private commitTarget: { w: number; h: number } | null = null;
  private commitTry = 0;
  private committingResize = false;


  private loadedImg?: LoadedImage;
  private maxSizeW: number | null = null;
  private maxSizeH: number | null = null;

  private applyingCropperFromInputs = false;
  private hasManualResizeTarget = false;

  resizeWidth: number | null = null;
  resizeHeight: number | null = null;

  private naturalWidth: number | null = null;
  private naturalHeight: number | null = null;

  protected translateService: TranslateExtraComponentsService;

  constructor(private readonly dialogService: DialogService, protected injector: Injector, private cdr: ChangeDetectorRef,
    private ngZone: NgZone,) {
    this.translateService = this.injector.get(TranslateExtraComponentsService);
  }

  setResizePreset(preset: ResizePreset | null): void {
    if (this.resizeLocked) return;

    this.resizePreset = preset;

    if (preset === 'avatar') {
      this.resizeRatioPreset = '1:1';
    } else {
      if (!this.resizeRatioPreset) {
        this.resizeRatioPreset = '16:9';
      }
    }

    this.applyResizeAspectFromState();
  }

  setResizeRatioPreset(preset: ResizeRatioPreset | null): void {
    if (this.resizeLocked) return;

    this.resizeRatioPreset = preset;

    if (!this.resizePreset) {
      this.resizePreset = 'horizontal';
    }

    this.applyResizeAspectFromState();
  }

  private getBaseRatio(preset: ResizeRatioPreset): number | null {
    switch (preset) {
      case '1:1': return 1;
      case '2:1': return 2;
      case '3:2': return 3 / 2;
      case '4:3': return 4 / 3;
      case '5:4': return 5 / 4;
      case '16:9': return 16 / 9;
    }
  }

  onCropperChange(pos: CropperPosition): void {
    if (this.applyingCropperFromInputs) return;

    this.cropperPosition = pos;

    if (this.activeTool === 'resize' && !this.resizeLocked) {
      this.resizeWidth = Math.round(pos.x2 - pos.x1);
      this.resizeHeight = Math.round(pos.y2 - pos.y1);
    }
  }

  private applyResizeAspectFromState(): void {
    if (this.resizePreset == null || this.resizeRatioPreset == null) {
      this.roundCropper = false;
      this.setCropRatio(null);
      return;
    }

    if (this.resizePreset === 'avatar') {
      this.roundCropper = true;
      this.setCropRatio(1);
      return;
    }

    this.roundCropper = false;

    if (this.resizeRatioPreset === 'custom') {
      this.setCropRatio(null);
      return;
    }

    const base = this.getBaseRatio(this.resizeRatioPreset)!;
    const ratio = this.resizePreset === 'vertical' ? (1 / base) : base;
    this.setCropRatio(ratio);
  }

  toggleResizeLock(): void {
    this.resizeLocked = !this.resizeLocked;

    if (this.resizeLocked) {
      const w = this.resizeWidth ?? this.lastCropped?.width ?? this.naturalWidth;
      const h = this.resizeHeight ?? this.lastCropped?.height ?? this.naturalHeight;

      this.lockedW = w ?? null;
      this.lockedH = h ?? null;
    } else {
      this.lockedW = null;
      this.lockedH = null;
    }
  }

  get cropperStaticWidth(): number {
    return this.resizeLocked && this.lockedW ? this.lockedW : 0;
  }
  get cropperStaticHeight(): number {
    return this.resizeLocked && this.lockedH ? this.lockedH : 0;
  }

  get toolsValue(): ToolsUI {
    return this.uploadOverlay ? 'upload' : this.activeTool;
  }

  isBig(i: number): boolean {
    return (i + 1) % 5 === 0;
  }

  private dotWidth(i: number): number {
    return this.isBig(i) ? this.BIG : this.SMALL;
  }

  private tapeWidthPx(count: number): number {
    let w = 0;
    for (let i = 0; i < count; i++) w += this.dotWidth(i);
    w += (count - 1) * this.GAP;
    return w;
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  get rotateDotsTranslatePx(): number {
    if (this.cropAdjustMode === 'scale') return 0;

    const min = Number(this.adjustMin);
    const max = Number(this.adjustMax);
    const val = Number(this.adjustValue);

    if (!isFinite(min) || !isFinite(max) || max === min || !isFinite(val)) return 0;

    const t = (this.clamp(val, min, max) - min) / (max - min);
    const tapeW = this.tapeWidthPx(this.dotsTape.length);
    const extra = Math.max(0, tapeW - this.VIEWPORT_W);

    return (0.5 - t) * extra;
  }

  get scaleDotsTranslatePx(): number {
    if (this.cropAdjustMode !== 'scale') return 0;

    const min = Number(this.adjustMin);
    const max = Number(this.adjustMax);
    const val = Number(this.adjustValue);

    if (!isFinite(min) || !isFinite(max) || max === min || !isFinite(val)) return 0;

    const t = (this.clamp(val, min, max) - min) / (max - min);
    const tapeW = this.tapeWidthPx(this.dotsTape.length);
    const extra = Math.max(0, tapeW - this.VIEWPORT_W);

    return -t * extra;
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

  onCropperReady(dim: any): void {
    this.cropperIsReady = true;
    this.maxSizeW = typeof dim?.width === 'number' ? dim.width : null;
    this.maxSizeH = typeof dim?.height === 'number' ? dim.height : null;
  }

  private async resizeBlobToExact(
    src: Blob,
    targetW: number,
    targetH: number,
    opts?: { onlyScaleDown?: boolean }
  ): Promise<Blob> {
    const img = await this.blobToHtmlImage(src);

    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;

    let w = Math.max(1, Math.round(targetW));
    let h = Math.max(1, Math.round(targetH));

    if (opts?.onlyScaleDown) {
      w = Math.min(w, srcW);
      h = Math.min(h, srcH);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const mime = src.type || 'image/png';
    const quality = (mime === 'image/jpeg' || mime === 'image/webp') ? 0.95 : undefined;

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))), mime, quality as any);
    });
  }

  onResizeBoxCommit(changed: 'w' | 'h'): void {
    if (this.resizeLocked) return;
    if (this.activeTool !== 'resize') return;

    const w0 = this.toPx(this.resizeWidth);
    const h0 = this.toPx(this.resizeHeight);
    if (w0 == null || h0 == null) return;

    let w = w0;
    let h = h0;

    const enforceRatio =
      this.resizePreset === 'avatar' ||
      this.resizeRatioPreset === '1:1' ||
      (this.resizeRatioPreset !== 'custom' && this.maintainAspectRatio && !!this.aspectRatio);

    if (enforceRatio && this.aspectRatio) {
      if (changed === 'w') {
        h = Math.max(1, Math.round(w / this.aspectRatio));
        this.resizeHeight = h;
      } else {
        w = Math.max(1, Math.round(h * this.aspectRatio));
        this.resizeWidth = w;
      }
    }

    this.hasManualResizeTarget = true;
  }

  private toPx(v: any): number | null {
    const n = Number(v);
    if (!isFinite(n)) return null;
    const r = Math.round(n);
    return r > 0 ? r : null;
  }

  onAdjustInput(raw: string): void {
    const v = Number(raw);

    if (this.cropAdjustMode === 'rotation') {
      this.applyRotation(v);
    } else {
      this.applyScalePercent(v);
    }
  }

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

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  private refreshCropperLayout(): void {
    this.cdr.detectChanges();

    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.cropperComp?.onResize();
      window.dispatchEvent(new Event('resize'));
    });
  }

  onToolChange(value: ToolsUI): void {
    if (value === 'upload') {
      this.uploadOverlay = true;
      this.dragOver = false;
      return;
    }

    this.uploadOverlay = false;
    this.activeTool = value;

    if (value === 'resize') {
      this.syncResizeInputsFromCurrent();
    }

    this.refreshCropperLayout();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const ok = this.loadFile(file);
    if (ok) {
      this.uploadOverlay = false;
      this.activeTool = 'crop';
    }
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

    const ok = this.loadFile(file);
    if (ok) {
      this.uploadOverlay = false;
      this.activeTool = 'crop';
    }
  }

  private loadFile(file: File): boolean {
    if (!file.type?.startsWith('image/')) return false;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) return false;

    this.resetEditorState();
    this.selectedFile = file;
    this.cropperLoading = true;
    return true;
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
    this.roundCropper = false;
    this.resizePreset = null;
    this.resizeLocked = false;
    this.lockedW = null;
    this.lockedH = null;
    this.resizeRatioPreset = 'custom';
    this.cropperPosition = { ...this.INIT_CROPPER };
    this.cropperIsReady = false;
    this.hasManualResizeTarget = false;
  }

  onImageCropped(e: ImageCroppedEvent): void {
    this.lastCropped = e;

    const hasSize = typeof e.width === 'number' && typeof e.height === 'number';
    if (!hasSize) {
      return;
    }

    if (this.committingResize && this.commitTarget) {
      const tw = this.commitTarget.w;
      const th = this.commitTarget.h;

      const dw = tw - e.width;
      const dh = th - e.height;

      if (dw === 0 && dh === 0) {
        this.committingResize = false;
        this.resizeWidth = tw;
        this.resizeHeight = th;
        return;
      }

      if (this.commitTry >= 2) {
        this.committingResize = false;
        this.resizeWidth = e.width;
        this.resizeHeight = e.height;
        return;
      }

      if (!this.getScreenToOutputRatios()) {
        this.committingResize = false;
        return;
      }

      this.commitTry++;
      this.applyCropperForOutput(Math.max(1, tw), Math.max(1, th));
      return;
    }

    if (!this.resizeLocked && this.activeTool === 'resize' && !this.hasManualResizeTarget) {
      this.resizeWidth = e.width;
      this.resizeHeight = e.height;
      this.syncResizeInputsFromCurrent();
    }
  }

  private getScreenToOutputRatios(): { rx: number; ry: number } | null {
    const maxW = this.maxSizeW;
    const maxH = this.maxSizeH;
    const tW = this.loadedImg?.transformed?.size?.width ?? this.naturalWidth;
    const tH = this.loadedImg?.transformed?.size?.height ?? this.naturalHeight;

    if (!maxW || !maxH || !tW || !tH) return null;

    return { rx: tW / maxW, ry: tH / maxH };
  }

  private applyCropperForOutput(targetOutW: number, targetOutH: number): void {
    if (!this.cropperIsReady) return;

    const ratios = this.getScreenToOutputRatios();
    if (!ratios) return;

    const { rx, ry } = ratios;

    const desiredScreenW = Math.max(1, Math.round(targetOutW / rx));
    const desiredScreenH = Math.max(1, Math.round(targetOutH / ry));

    const cur = this.cropperPosition;
    const imgW = this.maxSizeW;
    const imgH = this.maxSizeH;
    const isInit = cur.x2 > 1_000_000 || cur.y2 > 1_000_000;

    const cx = isInit ? imgW / 2 : (cur.x1 + cur.x2) / 2;
    const cy = isInit ? imgH / 2 : (cur.y1 + cur.y2) / 2;

    const w = Math.min(desiredScreenW, imgW);
    const h = Math.min(desiredScreenH, imgH);

    let x1 = cx - w / 2;
    let y1 = cy - h / 2;

    x1 = Math.max(0, Math.min(x1, imgW - w));
    y1 = Math.max(0, Math.min(y1, imgH - h));

    const x1i = Math.round(x1);
    const y1i = Math.round(y1);

    this.cropperPosition = {
      x1: x1i,
      y1: y1i,
      x2: x1i + w,
      y2: y1i + h
    };

    this.refreshCropperLayout();
  }

  onImageLoaded(img?: any): void {
    this.cropperLoading = false;

    this.loadedImg = img;

    const w = img?.original?.size?.width ?? img?.width;
    const h = img?.original?.size?.height ?? img?.height;

    if (typeof w === 'number' && typeof h === 'number') {
      this.naturalWidth = w;
      this.naturalHeight = h;
    }

    this.syncResizeInputsFromCurrent();
    this.refreshCropperLayout();
  }

  private syncResizeInputsFromCurrent(): void {
    if (this.resizeLocked) return;
    if (this.hasManualResizeTarget) return;

    const w = this.lastCropped?.width ?? this.naturalWidth;
    const h = this.lastCropped?.height ?? this.naturalHeight;
    if (!w || !h) return;

    this.resizeWidth ??= w;
    this.resizeHeight ??= h;
  }

  onLoadImageFailed(): void {
    this.cropperLoading = false;
    console.error('[o-image-editor] loadImageFailed');
  }

  async save(): Promise<void> {
    const blob = await this.getFinalBlob();
    if (!blob) {
      this.dialogService.warn('SAVE', 'NOT_IMAGE');
      return;
    }

    const suggestedName = this.buildSuggestedFileName(blob.type || 'image/png');

    const saved = await this.persistBlobToDisk(blob, suggestedName);
    if (!saved) {
      return;
    }

    this.askLoadNewOrContinue();
  }

  private getCroppedBlob(): Blob | null {
    const fromBlob = this.lastCropped?.blob;
    if (fromBlob instanceof Blob) return fromBlob;

    const b64 = this.lastCropped?.base64;
    if (typeof b64 === 'string' && b64.length) {
      return base64ToFile(b64);
    }

    return null;
  }

  private async getFinalBlob(): Promise<Blob | null> {
    let base = this.getCroppedBlob();
    if (!base) return null;

    if (this.hasManualResizeTarget && this.resizeWidth && this.resizeHeight) {
      base = await this.resizeBlobToExact(base, this.resizeWidth, this.resizeHeight);
    }

    if (!this.roundCropper) return base;

    try {
      return await this.makeCircularPng(base);
    } catch (e) {
      console.error('[o-image-editor] makeCircularPng failed', e);
      return base;
    }
  }

  private async makeCircularPng(src: Blob): Promise<Blob> {
    const img = await this.blobToHtmlImage(src);

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const size = Math.min(w, h);

    const sx = Math.max(0, (w - size) / 2);
    const sy = Math.max(0, (h - size) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    ctx.restore();

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))), 'image/png', 0.95);
    });
  }

  private buildSuggestedFileName(mime: string): string {
    let ext = 'png';

    if (mime.includes('jpeg')) {
      ext = 'jpg';
    } else if (mime.includes('webp')) {
      ext = 'webp';
    }

    return `image_edited.${ext}`;
  }

  private async persistBlobToDisk(blob: Blob, suggestedName: string): Promise<boolean> {
    const g = globalThis as any;

    if (typeof g.showSaveFilePicker === 'function') {
      try {
        const handle = await g.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: 'PNG image',
              accept: { 'image/png': ['.png'] }
            },
            {
              description: 'JPEG image',
              accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
            },
            {
              description: 'WebP image',
              accept: { 'image/webp': ['.webp'] }
            }
          ]
        });

        const targetMime = this.mimeFromFilename(handle?.name) ?? (blob.type || 'image/png');

        const finalBlob = await this.convertBlobToMime(blob, targetMime, {
          background: (this.roundCropper && targetMime === 'image/jpeg') ? '#ffffff' : null
        });

        const writable = await handle.createWritable();
        await writable.write(finalBlob);
        await writable.close();
        return true;

      } catch (e: any) {
        if (e?.name === 'AbortError') return false;
        const action = this.getText('SAVE');
        const message = this.getText('NOT_IMAGE');
        this.dialogService.error(action, message);
        return false;
      }
    }

    this.downloadBlob(blob, suggestedName);
    return true;
  }

  private mimeFromFilename(name?: string): string | null {
    if (!name) return null;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      default: return null;
    }
  }

  private blobToHtmlImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        const error =
          err instanceof Error ? err : new Error('Failed to load image from Blob');
        reject(error);
      };

      img.src = url;
    });
  }

  private async convertBlobToMime(
    src: Blob,
    targetMime: string,
    opts?: { background?: string | null }
  ): Promise<Blob> {
    const normalized = targetMime === 'image/jpg' ? 'image/jpeg' : targetMime;

    if ((src.type || '') === normalized) return src;

    const img = await this.blobToHtmlImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    if (opts?.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    ctx.drawImage(img, 0, 0, w, h);

    const quality = (normalized === 'image/jpeg' || normalized === 'image/webp') ? 0.95 : undefined;

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))),
        normalized,
        quality as any
      );
    });
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
    const actionNew = this.getText('UPLOAD_NEW');
    const actionEdit = this.getText('KEEP_EDITING');
    const saveMessage = this.getText('SAVE_CONFIRM');
    const question = this.getText('QUESTION');

    const config: ODialogConfig = {
      icon: 'save',
      okButtonText: actionNew,
      cancelButtonText: actionEdit
    };

    this.dialogService.confirm(
      saveMessage,
      question,
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
    this.resetEditsState();
    this.cdr.detectChanges();

    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.cropperComp?.resetCropperPosition();
    });
  }

  private resetEditsState(): void {
    this.lastCropped = undefined;
    this.canvasRotation = 0;
    this.transform = { scale: 1, rotate: 0, flipH: false, flipV: false };
    this.rotationDeg = 0;
    this.scalePercent = 0;

    this.resizeLocked = false;
    this.lockedW = null;
    this.lockedH = null;

    this.resizePreset = null;
    this.resizeRatioPreset = 'custom';
    this.roundCropper = false;
    this.applyResizeAspectFromState();

    if (this.naturalWidth && this.naturalHeight) {
      this.resizeWidth = this.naturalWidth;
      this.resizeHeight = this.naturalHeight;
    } else {
      this.resizeWidth = null;
      this.resizeHeight = null;
    }

    this.cropperPosition = { ...this.INIT_CROPPER };
    this.cropperIsReady = false;
    this.hasManualResizeTarget = false;
  }

  private getText(text: string): string {
    if (this.translateService) {
      return this.translateService.get(text);
    }
    return text;
  }

}
