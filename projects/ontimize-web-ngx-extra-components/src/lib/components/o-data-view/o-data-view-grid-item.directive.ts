import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[oDataViewGridItem]'
})
export class ODataViewGridItemDirective {
  constructor(public template: TemplateRef<any>) { }
}
