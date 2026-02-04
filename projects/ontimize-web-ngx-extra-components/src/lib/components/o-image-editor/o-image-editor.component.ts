import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CropperPosition,
  Dimensions,
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform
} from 'ngx-image-cropper';
import { DialogService, OTranslateService } from 'ontimize-web-ngx';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { Image } from '../../models/image.model';

/**
 * Data que llega cuando el componente se abre en MatDialog (modo modal).
 * Mantiene compatibilidad con tu implementación actual.
 */
export interface OImageEditorDialogData {
  images: Image.Image[];
  allowMultiple: boolean;
  orientation?: 'vertical' | 'horizontal' | null;
  loadImageFn?: (imageFilename: string) => Observable<File>;
  moveImageFn?: (fromIndex: number, toIndex: number) => void;
  filesSelectedFn?: (event: any) => void;
  onImageUpdated?: Subject<Image.Image[]>;
  onUpdated?: EventEmitter<Image.NewImage[] | File>;
  onDeleted?: EventEmitter<Image.Image>;
}

/**
 * Config opcional para extender cropper sin tocar demasiado tu template
 */
export interface OImageEditorCropperOptions {
  imageQuality?: number; // default 95
  format?: 'png' | 'jpeg' | 'bmp' | 'webp'; // default 'jpeg'
  hideResizeSquares?: boolean; // default true
  maintainAspectRatio?: boolean; // default true
  allowMoveImage?: boolean; // default true
}

export const O_IMAGE_EDITOR_INPUTS: string[] = [
  // === Inline (standalone) ===
  'images',
  'allowMultiple:allow-multiple',
  'orientation',
  'loadImageFn:load-image-fn',
  'moveImageFn:move-image-fn',
  'filesSelectedFn:files-selected-fn',
  'onImageUpdated:on-image-updated',

  // === Extra ===
  'cropperOptions:cropper-options'
];

export const O_IMAGE_EDITOR_OUTPUTS: string[] = [
  // === API propia ===
  'onUpdated',
  'onDeleted',
  'onCancel',

  // === eventos del cropper (si quieres exponerlos) ===
  'onImageCropped',
  'onImageLoaded',
  'onCropperReady',
  'onLoadImageFailed',
  'onImageChanged'
];

@Component({
  selector: 'o-image-editor',
  templateUrl: './o-image-editor.component.html',
  styleUrls: ['./o-image-editor.component.scss'],
  inputs: O_IMAGE_EDITOR_INPUTS,
  outputs: O_IMAGE_EDITOR_OUTPUTS
})
export class OImageEditorComponent implements OnInit, OnDestroy {
  // =========================
  // Inline API (standalone)
  // =========================
  @Input() images: Image.Image[] = [];
  @Input('allow-multiple') allowMultiple = false;
  @Input() orientation: 'vertical' | 'horizontal' | null = null;

  @Input('load-image-fn') loadImageFn?: (imageFilename: string) => Observable<File>;
  @Input('move-image-fn') moveImageFn?: (fromIndex: number, toIndex: number) => void;
  @Input('files-selected-fn') filesSelectedFn?: (event: any) => void;
  @Input('on-image-updated') onImageUpdated?: Subject<Image.Image[]>;

  @Input('cropper-options') cropperOptions?: OImageEditorCropperOptions;

  // =========================
  // Outputs (standalone)
  // =========================
  @Output() onUpdated = new EventEmitter<Image.NewImage[] | File>();
  @Output() onDeleted = new EventEmitter<Image.Image>();
  @Output() onCancel = new EventEmitter<void>();

  // Re-emit opcional de eventos del cropper
  @Output() onImageCropped = new EventEmitter<ImageCroppedEvent>();
  @Output() onImageLoaded = new EventEmitter<void>();
  @Output() onCropperReady = new EventEmitter<Dimensions>();
  @Output() onLoadImageFailed = new EventEmitter<void>();
  @Output() onImageChanged = new EventEmitter<any>();

  // =========================
  // View / Cropper
  // =========================
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  // Estado interno (tu lógica original)
  protected croppedImages: Map<
    number,
    {
      blob: Blob;
      width: number;
      height: number;
      cropperPosition: CropperPosition | null;
      scale: number;
      translateH: number;
      translateV: number;
      modified: boolean;
    }
  > = new Map();

  protected aspectRatio = 1 / 1;
  protected zoom = 1;
  protected minZoom = 1;
  protected maxZoom = 5;
  protected selectedIndex: number | null = null;

  protected transform: ImageTransform = {
    translateUnit: 'px',
    scale: this.zoom,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0
  };

  protected cropper: CropperPosition = {
    x1: -100,
    x2: 10000,
    y1: -100,
    y2: 10000
  };

  protected originalImageDimensions: { width: number; height: number } = { width: 0, height: 0 };
  protected loading = false;
  protected loadingCropperImage = false;

  private imageUpdatedSubscription: Subscription | null = null;

  // =========================
  // Dialog compat (tu caso actual)
  // =========================
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: OImageEditorDialogData | null,
    @Optional() private dialogRef: MatDialogRef<OImageEditorComponent> | null,
    private translate: OTranslateService,
    private dialogService: DialogService
  ) { }

  /**
   * Contexto unificado:
   * - si viene por dialog, usa data.*
   * - si no, usa inputs
   */
  public get ctxImages(): Image.Image[] {
    return this.data?.images ?? this.images ?? [];
  }
  private set ctxImages(value: Image.Image[]) {
    if (this.data) this.data.images = value;
    else this.images = value;
  }

  public get ctxAllowMultiple(): boolean {
    return this.data?.allowMultiple ?? this.allowMultiple;
  }

  private get ctxOrientation(): 'vertical' | 'horizontal' | null {
    return this.data?.orientation ?? this.orientation ?? null;
  }

  private get ctxLoadImageFn(): ((imageFilename: string) => Observable<File>) | undefined {
    return this.data?.loadImageFn ?? this.loadImageFn;
  }

  private get ctxMoveImageFn(): ((fromIndex: number, toIndex: number) => void) | undefined {
    return this.data?.moveImageFn ?? this.moveImageFn;
  }

  private get ctxFilesSelectedFn(): ((event: any) => void) | undefined {
    return this.data?.filesSelectedFn ?? this.filesSelectedFn;
  }

  private get ctxOnImageUpdated(): Subject<Image.Image[]> | undefined {
    return this.data?.onImageUpdated ?? this.onImageUpdated;
  }

  // =========================
  // Getters usados en template
  // =========================
  get selectedImage(): Image.Image | null {
    if (!this.ctxImages || this.ctxImages.length === 0) return null;
    const idx = this.selectedIndex ?? 0;
    return this.ctxImages[idx] ?? null;
  }

  get isCropperLoaded(): boolean {
    return !!this.selectedImage?.file && !this.loadingCropperImage;
  }

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    if (this.ctxImages && this.ctxImages.length > 0) {
      this.selectImage(0);
    }

    this.updateAspectRatio('rectangular');
    this.loadImages();

    const subject = this.ctxOnImageUpdated;
    if (subject) {
      this.imageUpdatedSubscription?.unsubscribe();
      this.imageUpdatedSubscription = subject.subscribe(images => {
        if (images) {
          this.ctxImages = images;

          if (this.selectedIndex !== null) {
            this.selectImage(this.selectedIndex, true);
          } else if (this.ctxImages.length > 0) {
            this.selectImage(0, true);
          }

          this.loadImages();
        } else {
          this.loading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.imageUpdatedSubscription?.unsubscribe();
  }

  // =========================
  // UI actions (tu lógica)
  // =========================
  protected fileInputClick(): void {
    if (this.fileInput) this.fileInput.nativeElement.click();
  }

  protected selectImage(index: number | null, forceReload: boolean = false): void {
    if (index === null) {
      this.selectedIndex = null;
      return;
    }
    if (this.selectedIndex === index && !forceReload) return;

    this.loadingCropperImage = true;
    const image = this.ctxImages[index];
    if (image) {
      this.selectedIndex = index;
    } else {
      this.selectedIndex = null;
    }
  }

  protected imageLoaded(): void {
    this.loadingCropperImage = false;
    this.onImageLoaded.emit();

    // compat si alguien sigue pasando emitters en data
    this.data?.onUpdated; // no-op, solo para dejar claro compat
  }

  protected cropperReady(sourceImageDimensions: Dimensions): void {
    this.onCropperReady.emit(sourceImageDimensions);

    this.loading = false;
    this.originalImageDimensions = sourceImageDimensions;

    const selectedIdx = this.selectedIndex ?? 0;
    const selected = this.croppedImages.get(selectedIdx);

    if (selected) {
      if (selected.cropperPosition) {
        this.cropper = {
          x1: selected.cropperPosition.x1,
          x2: selected.cropperPosition.x2,
          y1: selected.cropperPosition.y1,
          y2: selected.cropperPosition.y2
        };
        this.transform = {
          ...this.transform,
          scale: selected.scale,
          translateH: selected.translateH,
          translateV: selected.translateV
        };
        this.zoom = selected.scale;
      } else {
        this.updateZoom(true);
      }
    } else {
      this.zoom = 1;
      this.updateZoom(true);
    }
  }

  protected onFilesSelected(event: any): void {
    this.loading = true;

    // Si el consumer define su función (modal o inline), úsala
    const fn = this.ctxFilesSelectedFn;
    if (fn) {
      fn(event);
      return;
    }

    // Fallback inline: añade FileList directamente a ctxImages
    const files: FileList | null = event?.target?.files ?? null;
    if (!files || files.length === 0) {
      this.loading = false;
      return;
    }

    const newImages: Image.Image[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;

      const url = URL.createObjectURL(file);
      newImages.push({ filename: file.name, url, file } as any);
    }

    const updated = [...this.ctxImages];
    if (this.ctxAllowMultiple) {
      updated.push(...newImages);
    } else {
      updated.splice(0, updated.length, newImages[0]);
    }

    this.ctxImages = updated;
    this.ctxOnImageUpdated?.next(updated);

    this.loading = false;
    this.selectImage(0, true);
  }

  protected deleteImage(index: number): void {
    this.dialogService.confirm(this.translate.get('delete_photo_dialog'), this.translate.get('delete_photo_text'), {
      okButtonText: this.translate.get('ok')
    });

    this.dialogService.dialogRef.afterClosed().subscribe({
      next: result => {
        if (!result) return;

        const images = this.ctxImages;
        const deletedImage = images.splice(index, 1)[0];

        if (this.fileInput) this.fileInput.nativeElement.value = '';

        if (images.length === 0) {
          this.selectImage(null);
        } else {
          this.selectImage(Math.min(index, images.length - 1));
        }

        // Emit para inline
        this.onDeleted.emit(deletedImage);
        // Compat modal (si te lo pasaban en data)
        this.data?.onDeleted?.emit(deletedImage);

        this.ctxOnImageUpdated?.next(images);
      }
    });
  }

  protected save(): void {
    this.loading = true;

    if (this.ctxAllowMultiple) {
      const imagesToUpdate: Image.NewImage[] = [];
      for (let index = 0; index < this.ctxImages.length; index++) {
        const image = this.ctxImages[index];
        const croppedImage = this.croppedImages.get(index);

        if (croppedImage && croppedImage.modified) {
          const file = new File([croppedImage.blob], this.getFilename(image.filename), {
            type: croppedImage.blob.type
          });
          imagesToUpdate.push({ file, orderIndex: this.ctxImages.length + 1 });
        }
      }

      this.onUpdated.emit(imagesToUpdate);
      this.data?.onUpdated?.emit(imagesToUpdate);
    } else {
      const croppedImage = this.croppedImages.get(0);
      const image = this.ctxImages[0];

      if (croppedImage && image) {
        const file = new File([croppedImage.blob], this.getFilename(image.filename), {
          type: croppedImage.blob.type
        });

        this.onUpdated.emit(file);
        this.data?.onUpdated?.emit(file);
      }
    }

    this.loading = false;
  }

  protected updateAspectRatio(value: 'square' | 'rectangular'): void {
    if (value === 'square') {
      this.aspectRatio = 1 / 1;
    } else if (value === 'rectangular' && this.ctxOrientation === 'vertical') {
      this.aspectRatio = 1 / 1.5;
    } else if (value === 'rectangular' && this.ctxOrientation === 'horizontal') {
      this.aspectRatio = 1.5 / 1;
    } else {
      // si no hay orientación, usa cuadrado por defecto o ajusta a tu gusto
      this.aspectRatio = 1 / 1;
    }
  }

  protected updateZoom(applyTransform: boolean): void {
    this.transform = {
      ...this.transform,
      scale: this.zoom
    };
    if (applyTransform) this.transformChange(this.transform);
  }

  protected zoomIn(): void {
    const current = this.transform.scale ?? this.zoom;
    this.zoom = Math.min(current + 0.1, this.maxZoom);
    this.updateZoom(false);
  }

  protected zoomOut(): void {
    const current = this.transform.scale ?? this.zoom;
    this.zoom = Math.max(current - 0.1, this.minZoom);
    this.updateZoom(true);
  }

  protected reset(): void {
    this.zoom = this.minZoom;
    this.transform = {
      translateUnit: 'px',
      scale: this.zoom,
      translateH: 0,
      translateV: 0
    };

    this.imageCropper?.resetCropperPosition();

    for (const [key, value] of this.croppedImages.entries()) {
      this.croppedImages.set(key, {
        ...value,
        modified: false,
        cropperPosition: null,
        scale: this.zoom,
        translateH: 0,
        translateV: 0
      });
    }
  }

  protected imageCropped(event: ImageCroppedEvent): void {
    this.onImageCropped.emit(event);

    const idx = this.selectedIndex ?? 0;
    const croppedImage = {
      blob: event.blob!,
      width: event.width!,
      height: event.height!,
      cropperPosition: event.cropperPosition ?? null,
      scale: this.zoom,
      translateH: this.transform.translateH ?? 0,
      translateV: this.transform.translateV ?? 0,
      modified: false
    };

    const existingImage = this.ctxImages[idx];
    // Mantengo tu criterio, pero con null-safety
    croppedImage.modified =
      !!existingImage &&
      !!croppedImage.blob &&
      croppedImage.blob.size !== (existingImage.file?.size ?? -1) &&
      croppedImage.scale !== this.minZoom;

    this.croppedImages.set(idx, croppedImage);
  }

  protected close(): void {
    let anyModified = false;
    this.croppedImages.forEach(img => {
      if (img.modified) anyModified = true;
    });

    if (!anyModified) {
      this.onCancel.emit();
      this.dialogRef?.close();
      return;
    }

    this.dialogService
      .confirm(this.translate.get('confirm'), this.translate.get('confirm_unsaved_changes'), {
        okButtonText: this.translate.get('ok')
      })
      .then(res => {
        if (res) {
          this.onCancel.emit();
          this.dialogRef?.close();
        }
      });
  }

  protected getZoomPercentage(zoom: number): number {
    return ((zoom - this.minZoom) / (this.maxZoom - this.minZoom)) * 100;
  }

  protected onDragStart(event: DragEvent, index: number): void {
    event.dataTransfer?.setData('index', index.toString());
  }

  protected onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const draggedIndexStr = event.dataTransfer?.getData('index');

    if (!draggedIndexStr) return;

    const draggedIndex = parseInt(draggedIndexStr, 10);
    if (Number.isNaN(draggedIndex)) return;
    if (!this.ctxImages[index] || !this.ctxImages[draggedIndex]) return;

    const fn = this.ctxMoveImageFn;
    if (fn) {
      fn(draggedIndex, index);
    } else {
      // fallback inline: reordenar aquí mismo
      const arr = this.ctxImages;
      const [moved] = arr.splice(draggedIndex, 1);
      arr.splice(index, 0, moved);
      this.ctxOnImageUpdated?.next(arr);
    }

    this.selectedIndex = index;
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  transformChange(transform: ImageTransform): void {
    const scale = transform.scale ?? 1;

    const displayWidth = parseInt((this.originalImageDimensions.width * scale).toFixed(0), 10);
    const displayHeight = parseInt((this.originalImageDimensions.height * scale).toFixed(0), 10);

    const overflowX = (displayWidth - this.originalImageDimensions.width) / 2;
    const overflowY = (displayHeight - this.originalImageDimensions.height) / 2;

    if (transform.translateH != null && transform.translateH > overflowX) {
      this.transform.translateH = overflowX;
    } else if (transform.translateH != null && transform.translateH < -overflowX) {
      this.transform.translateH = -overflowX;
    }

    if (transform.translateV != null && transform.translateV > overflowY) {
      this.transform.translateV = overflowY;
    } else if (transform.translateV != null && transform.translateV < -overflowY) {
      this.transform.translateV = -overflowY;
    }
  }

  private loadImages(): void {
    const loadImageFn = this.ctxLoadImageFn;

    // Si NO hay loadImageFn, asumimos inline: o bien ya viene file, o viene url.
    // En ese caso no hacemos nada aquí.
    if (!loadImageFn) {
      this.loading = false;
      return;
    }

    const imgs = this.ctxImages;
    if (!imgs || imgs.length === 0) {
      this.loading = false;
      return;
    }

    this.loading = true;

    for (let index = 0; index < imgs.length; index++) {
      const image = imgs[index];
      if (!image) continue;

      loadImageFn(image.filename).subscribe(file => {
        image.file = file;

        if (index === imgs.length - 1) {
          this.reset();
          this.loading = false;
          if (this.fileInput) this.fileInput.nativeElement.value = '';
        }
      });
    }
  }

  private getFilename(filename: string): string {
    const extensionIndex = filename.lastIndexOf('.');
    const ext = extensionIndex >= 0 ? filename.substring(extensionIndex) : '';
    const nameWithoutExt = extensionIndex >= 0 ? filename.substring(0, extensionIndex) : filename;

    const baseName = nameWithoutExt.replace(/-cropped-[\w-]+$/, '');
    const newUuid = crypto.randomUUID();

    return `${baseName}-cropped-${newUuid}${ext}`;
  }

  protected onDragOverImageGrid(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDropOnImageGrid(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer && event.dataTransfer.files && !event.dataTransfer.getData('index')) {
      const files = event.dataTransfer.files;

      // En navegadores modernos, la asignación directa a input.files puede no estar permitida.
      // Pero mantengo tu lógica para compat y disparo el handler igualmente.
      if (this.fileInput) {
        try {
          (this.fileInput.nativeElement as any).files = files;
        } catch {
          // ignore
        }
        this.onFilesSelected({ target: { files } });
      }
    }
  }

  /**
   * Returns the medium size URL or fallback URL.
   */
  protected getMediumUrl(image: Image.Image): string | null {
    if (image) {
      if ((image as any).imageSize) {
        return (image as any).imageSize.mediumUrl;
      }
      return (image as any).url ?? null;
    }
    return null;
  }

  /**
   * Handles image load errors and sets a fallback URL.
   */
  protected onImageError(event: any, image: Image.Image): void {
    const imgElement = event.target;
    const url = (image as any).url;

    if (url && imgElement.src !== url) {
      imgElement.src = url;
    } else {
      imgElement.onerror = null;
    }
  }

  // Helpers de defaults para el template (si usas cropperOptions)
  get optImageQuality(): number {
    return this.cropperOptions?.imageQuality ?? 95;
  }
  get optFormat(): 'png' | 'jpeg' | 'bmp' | 'webp' {
    return this.cropperOptions?.format ?? 'jpeg';
  }
  get optHideResizeSquares(): boolean {
    return this.cropperOptions?.hideResizeSquares ?? true;
  }
  get optMaintainAspectRatio(): boolean {
    return this.cropperOptions?.maintainAspectRatio ?? true;
  }
  get optAllowMoveImage(): boolean {
    return this.cropperOptions?.allowMoveImage ?? true;
  }
}
