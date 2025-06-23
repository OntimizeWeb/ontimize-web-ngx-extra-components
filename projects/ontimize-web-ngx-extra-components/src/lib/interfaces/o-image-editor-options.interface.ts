import { CropperOptions } from "ngx-image-cropper";
/**
 * Configuration interface for the OImageEditor component.
 * Extends the CropperOptions from ngx-image-cropper and adds
 * additional customization options.
 */
export interface OImageEditorOptions extends CropperOptions {
  /**
   * Whether to display the crop area dimensions (in pixels). Default is false.
   */
  showCropDimensions?: boolean;

  /**
   * Whether to enable the zoom slider (zoom only in, no zoom out). Default is false.
   */
  enableZoomSlider?: boolean;

  /**
   * Maximum allowed zoom level (e.g., 3 means 300%). Default is false.
   */
  zoomMax?: number;

  /**
   * Whether to show a toggle button for switching between square
   * and rectangular crop modes.
   */
  toggleAspectRatio?: boolean;

  /**
   * Custom aspect ratio value for square crop mode (default is 1).
   */
  aspectRatioSquare?: number;

  /**
   * Custom aspect ratio value for rectangular crop mode (default is 16/9).
   */
  aspectRatioRect?: number;
}
