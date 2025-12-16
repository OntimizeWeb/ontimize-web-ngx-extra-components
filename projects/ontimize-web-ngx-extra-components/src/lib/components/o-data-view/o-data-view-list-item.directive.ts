import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[oDataViewListItem]'
})
export class ODataViewListItemDirective {
  constructor(public template: TemplateRef<any>) { }
}
