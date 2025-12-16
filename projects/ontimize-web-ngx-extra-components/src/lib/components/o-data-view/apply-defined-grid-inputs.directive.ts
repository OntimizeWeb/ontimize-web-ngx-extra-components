import { Directive, Host, Input, OnChanges } from '@angular/core';
import { OGridComponent } from 'ontimize-web-ngx';

@Directive({
  selector: '[applyDefinedGridInputs]'
})
export class ApplyDefinedGridInputsDirective implements OnChanges {

  @Input() applyDefinedGridInputs: Record<string, any> | null = null;

  constructor(@Host() private host: OGridComponent) { }

  ngOnChanges(): void {
    const src = this.applyDefinedGridInputs;
    if (!src) return;

    Object.keys(src).forEach((k) => {
      const v = src[k];
      if (v !== undefined) {
        (this.host as any)[k] = v;
      }
    });
  }
}
