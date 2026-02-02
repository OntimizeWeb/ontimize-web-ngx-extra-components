import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CropperPosition, Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { DialogService, OTranslateService } from 'ontimize-web-ngx';
import { Observable, Subject, Subscription } from 'rxjs';
import { Image } from '../../models/image.model';

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
export class OImageEditorComponent implements OnInit, OnDestroy{
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;
  protected croppedImages: Map<
    number,
    {
      blob: Blob;
      width: number;
      height: number;
      cropperPosition: CropperPosition;
      scale: number;
      translateH: number;
      translateV: number;
      modified: boolean;
    }
  > = new Map();
  protected aspectRatio = 1 / 1;
  protected zoom: number = 1;
  protected minZoom: number = 1;
  protected maxZoom: number = 5;
  protected selectedIndex: number | null = null;

  protected transform: ImageTransform = {
    translateUnit: 'px',
    scale: this.zoom,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0,
  };
  protected cropper: CropperPosition = {
    x1: -100,
    x2: 10000,
    y1: -100,
    y2: 10000,
  };
  protected originalImageDimensions: { width: number; height: number } = { width: 0, height: 0 };
  protected loading = false;
  protected loadingCropperImage = false;

  private loadImageSubscription: Subscription = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      images: Image.Image[];
      allowMultiple: boolean;
      orientation?: 'vertical' | 'horizontal' | null;
      loadImageFn: (imageFilename: string) => Observable<File>;
      moveImageFn: (fromIndex: number, toIndex: number) => void;
      filesSelectedFn: (event: any) => void;
      onImageUpdated: Subject<Image.Image[]>;
      onUpdated: EventEmitter<Image.NewImage[] | File>;
      onDeleted: EventEmitter<Image.Image>;
    },
    private dialogRef: MatDialogRef<OImageEditorComponent>,
    private translate: OTranslateService,
    private dialogService: DialogService
  ) { }

  get selectedImage() {
    if (!this.data.images || this.data.images.length === 0) return null;
    return this.data.images[this.selectedIndex];
  }

  get isCropperLoaded() {
    return this.selectedImage?.file && !this.loadingCropperImage;
  }

  ngOnInit() {
    if (this.data && this.data.images && this.data.images.length > 0) {
      this.selectImage(0);
    }
    this.updateAspectRatio('rectangular');
    this.loadImages();
    if (this.data && this.data.onImageUpdated) {
      if (this.loadImageSubscription) this.loadImageSubscription.unsubscribe();
      this.loadImageSubscription = this.data.onImageUpdated.subscribe(images => {
        if (images) {
          this.data.images = images;
          if (this.selectedIndex !== null) {
            this.selectImage(this.selectedIndex, true);
          } else {
            this.selectImage(0);
          }
          this.loadImages();
        } else {
          this.loading = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.loadImageSubscription) this.loadImageSubscription.unsubscribe();
  }

  protected fileInputClick(): void {
    if (this.fileInput) this.fileInput.nativeElement.click();
  }

  protected selectImage(index: number, forceReload: boolean = false): void {
    if (index === null) {
      return;
    }
    if (this.selectedIndex == index && !forceReload) return;
    this.loadingCropperImage = true;
    const image = this.data.images[index];
    if (image) {
      this.selectedIndex = index;
    } else {
      this.selectedIndex = null;
    }
  }

  protected imageLoaded() {
    this.loadingCropperImage = false;
  }

  protected cropperReady(sourceImageDimensions: Dimensions) {
    this.loading = false;
    this.originalImageDimensions = sourceImageDimensions;
    const selectedImage = this.croppedImages.get(this.selectedIndex);
    if (selectedImage) {
      if (selectedImage.cropperPosition) {
        this.cropper = {
          x1: selectedImage.cropperPosition.x1,
          x2: selectedImage.cropperPosition.x2,
          y1: selectedImage.cropperPosition.y1,
          y2: selectedImage.cropperPosition.y2,
        };
        this.transform = {
          ...this.transform,
          scale: selectedImage.scale,
          translateH: selectedImage.translateH,
          translateV: selectedImage.translateV,
        };
        this.zoom = selectedImage.scale;
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
    this.data.filesSelectedFn(event);
  }

  protected deleteImage(index: number): void {
    this.dialogService.confirm(this.translate.get('delete_photo_dialog'), this.translate.get('delete_photo_text'), {
      okButtonText: this.translate.get('ok'),
    });

    this.dialogService.dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          const deletedImage = this.data.images.splice(index, 1)[0];
          if (this.fileInput) this.fileInput.nativeElement.value = '';
          if (this.data.images.length == 0) {
            this.selectImage(null);
          } else {
            this.selectImage(this.data.images.length - 1);
          }
          this.loading = true;
          this.data.onDeleted.emit(deletedImage);
        }
      },
    });
  }

  protected save(): void {
    this.loading = true;
    if (this.data.allowMultiple) {
      let imagesToUpdate: Image.NewImage[] = [];
      for (let index = 0; index < this.data.images.length; index++) {
        const image = this.data.images[index];
        const croppedImage = this.croppedImages.get(index);
        if (croppedImage && croppedImage.modified) {
          const file = new File([croppedImage.blob], this.getFilename(image.filename), {
            type: croppedImage.blob.type,
          });
          imagesToUpdate.push({ file: file, orderIndex: this.data.images.length + 1 });
        }
      }
      this.data.onUpdated.emit(imagesToUpdate);
    } else {
      const croppedImage = this.croppedImages.get(0);
      const image = this.data.images[0];
      const file = new File([croppedImage.blob], this.getFilename(image.filename), {
        type: croppedImage.blob.type,
      });
      this.data.onUpdated.emit(file);
    }
  }

  protected updateAspectRatio(value: 'square' | 'rectangular') {
    if (value === 'square') {
      this.aspectRatio = 1 / 1;
    } else if (value === 'rectangular' && this.data.orientation === 'vertical') {
      this.aspectRatio = 1 / 1.5;
    } else if (value === 'rectangular' && this.data.orientation === 'horizontal') {
      this.aspectRatio = 1.5 / 1;
    }
  }

  protected updateZoom(applyTransform: boolean) {
    this.transform = {
      ...this.transform,
      scale: this.zoom,
    };
    if (applyTransform) this.transformChange(this.transform);
  }

  protected zoomIn() {
    this.zoom = Math.min(this.transform.scale! + 0.1, this.maxZoom);
    this.updateZoom(false);
  }

  protected zoomOut() {
    this.zoom = Math.max(this.transform.scale! - 0.1, this.minZoom);
    this.updateZoom(true);
  }

  protected reset() {
    this.zoom = this.minZoom;
    this.transform = {
      translateUnit: 'px',
      scale: this.zoom,
      translateH: 0,
      translateV: 0,
    };
    this.imageCropper?.resetCropperPosition();
    for (const [key, value] of this.croppedImages.entries()) {
      this.croppedImages.set(key, { ...value, modified: false, cropperPosition: null, scale: this.zoom });
    }
  }

  protected imageCropped(event: ImageCroppedEvent) {
    const croppedImage = {
      blob: event.blob,
      width: event.width,
      height: event.height,
      cropperPosition: event.cropperPosition,
      scale: this.zoom,
      translateH: this.transform.translateH,
      translateV: this.transform.translateV,
      modified: false,
    };
    const existingImage = this.data.images[this.selectedIndex];
    croppedImage.modified = existingImage && croppedImage.blob.size !== existingImage.file?.size && croppedImage.scale != this.minZoom;
    this.croppedImages.set(this.selectedIndex, croppedImage);
  }

  protected close() {
    let anyModified;
    this.croppedImages.forEach(image => {
      if (image.modified) {
        anyModified = true;
      }
    });
    if (!anyModified) {
      this.dialogRef.close();
      return;
    }
    this.dialogService
      .confirm(this.translate.get('confirm'), this.translate.get('confirm_unsaved_changes'), {
        okButtonText: this.translate.get('ok'),
      })
      .then(res => {
        if (res) {
          this.dialogRef.close();
        }
      });
  }

  protected getZoomPercentage(zoom: number) {
    return ((zoom - this.minZoom) / (this.maxZoom - this.minZoom)) * 100;
  }

  protected onDragStart(event: DragEvent, index: number): void {
    event.dataTransfer.setData('index', index.toString());
  }

  protected onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const draggedIndex = event.dataTransfer.getData('index');
    if (draggedIndex !== null && this.data.images[index] && this.data.images[parseInt(draggedIndex, 10)]) {
      this.data.moveImageFn(parseInt(draggedIndex, 10), index);
      this.selectedIndex = index;
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  transformChange(transform: ImageTransform) {
    const displayWidth = parseInt((this.originalImageDimensions.width * transform.scale).toFixed(0), 10);
    const displayHeight = parseInt((this.originalImageDimensions.height * transform.scale).toFixed(0), 10);

    const overflowX = (displayWidth - this.originalImageDimensions.width) / 2;
    const overflowY = (displayHeight - this.originalImageDimensions.height) / 2;

    if (transform.translateH && transform.translateH > overflowX) {
      this.transform.translateH = overflowX;
    } else if (transform.translateH && transform.translateH < -overflowX) {
      this.transform.translateH = -overflowX;
    }

    if (transform.translateV && transform.translateV > overflowY) {
      this.transform.translateV = overflowY;
    } else if (transform.translateV && transform.translateV < -overflowY) {
      this.transform.translateV = -overflowY;
    }
  }

  private loadImages() {
    const loadImageFn = this.data.loadImageFn as (filename: string) => Observable<File>;
    if (loadImageFn) {
      this.loading = this.data.images.length > 0;
      for (let index = 0; index < this.data.images.length; index++) {
        const image = this.data.images[index];
        if (!image) return;
        loadImageFn(image.filename).subscribe(file => {
          image.file = file;
          if (index === this.data.images.length - 1) {
            this.reset();
            this.loading = false;
            if (this.fileInput) this.fileInput.nativeElement.value = '';
          }
        });
      }
    }
  }

  private getFilename(filename: string) {
    const extensionIndex = filename.lastIndexOf('.');
    const ext = filename.substring(extensionIndex);
    const nameWithoutExt = filename.substring(0, extensionIndex);

    const baseName = nameWithoutExt.replace(/-cropped-[\w-]+$/, '');
    const newUuid = crypto.randomUUID();

    return `${baseName}-cropped-${newUuid}${ext}`;
  }

  protected onDragOverImageGrid(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDropOnImageGrid(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files && !event.dataTransfer.getData('index')) {
      const files = event.dataTransfer.files;
      this.fileInput.nativeElement.files = files;
      this.onFilesSelected({ target: this.fileInput.nativeElement });
    }
  }

  /**
   * Returns the medium size URL or fallback URL.
   * @param image The image object. @returns The medium URL or null.
   */
  protected getMediumUrl(image: Image.Image): string {
    if (image) {
      if (image.imageSize) {
        return image.imageSize.mediumUrl;
      }
      return image.url;
    }
    return null;
  }

  /**
   * Handles image load errors and sets a fallback URL.
   * @param event The error event. @param image The image object.
   */
  protected onImageError(event: any, image: Image.Image) {
    const imgElement = event.target;

    if (image.url && imgElement.src !== image.url) {
      imgElement.src = image.url;
    } else {
      imgElement.onerror = null;
    }
  }
}
