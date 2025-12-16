import { Directive, Host, Input, OnChanges } from '@angular/core';
import { OTableComponent } from 'ontimize-web-ngx';

@Directive({
  selector: '[applyDefinedTableInputs]'
})
export class ApplyDefinedTableInputsDirective implements OnChanges {

  @Input() applyDefinedTableInputs: Record<string, any> | null = null;

  constructor(@Host() private host: OTableComponent) { }

  ngOnChanges(): void {
    const src = this.applyDefinedTableInputs;
    if (!src) return;

    Object.keys(src).forEach((k) => {
      const v = src[k];
      // No pisar defaults de Ontimize
      if (v !== undefined) {
        (this.host as any)[k] = v;
      }
    });
  }
}
