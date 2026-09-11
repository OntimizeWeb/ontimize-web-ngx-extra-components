import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[oDataViewGridItem]',
  standalone: true
})
export class ODataViewGridItemDirective {
  constructor(public template: TemplateRef<any>) { }
}
