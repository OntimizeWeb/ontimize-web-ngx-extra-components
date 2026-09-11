import { Directive, TemplateRef } from '@angular/core';

/**
 * Marks the template that renders a single item inside
 * `o-collection-editor`.
 *
 * Scoped to `ng-template` for the same reason as
 * {@link OCollectionGroupFieldsDirective}.
 */
@Directive({
  selector: 'ng-template[oCollectionItem]',
  standalone: true
})
export class OCollectionItemDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}
