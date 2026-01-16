import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[oDataViewTableColumns]'
})
export class ODataViewTableColumnsDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}
