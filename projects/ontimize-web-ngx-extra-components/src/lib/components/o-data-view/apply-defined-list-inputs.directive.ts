import { Directive, Host, Input, OnChanges } from '@angular/core';
import { OListComponent } from 'ontimize-web-ngx';

@Directive({
  selector: '[applyDefinedListInputs]'
})
export class ApplyDefinedListInputsDirective implements OnChanges {

  @Input() applyDefinedListInputs: Record<string, any> | null = null;

  constructor(@Host() private host: OListComponent) { }

  ngOnChanges(): void {
    const src = this.applyDefinedListInputs;
    if (!src) return;

    Object.keys(src).forEach((k) => {
      const v = src[k];
      if (v !== undefined) {
        (this.host as any)[k] = v;
      }
    });
  }
}
