import { Directive, TemplateRef } from '@angular/core';

@Directive({ selector: '[oDataViewGridItem]' })
export class ODataViewGridItemDirective {
  constructor(public template: TemplateRef<any>) { }
}
