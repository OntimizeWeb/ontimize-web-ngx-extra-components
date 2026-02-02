import { Injectable } from '@angular/core';

export namespace Image {
  @Injectable()
  export class Image {
    imageId: number;
    filename: string;
    file?: File;
    url: string;
    imageSize?: ImageSize;
    orderIndex: number;
    originalWidth?: number;
    originalHeight?: number;
  }
  @Injectable()
  export class ImageSize {
    largeUrl: string;
    mediumUrl: string;
    smallUrl: string;
  }

  @Injectable()
  export class NewImage {
    file: File;
    orderIndex: number;
  }
}