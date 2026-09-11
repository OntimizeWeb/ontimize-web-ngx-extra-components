import { Directive, TemplateRef } from '@angular/core';

/**
 * Marks the template that renders a group's own editable fields inside
 * `o-collection-editor`.
 *
 * The selector is scoped to `ng-template` on purpose (unlike
 * `ODataViewGridItemDirective`, which uses a bare attribute selector): a bare
 * selector compiles when placed on a `<div>` and then fails at runtime, because
 * there is no `TemplateRef` to inject.
 */
@Directive({
  selector: 'ng-template[oCollectionGroupFields]',
  standalone: true
})
export class OCollectionGroupFieldsDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}
