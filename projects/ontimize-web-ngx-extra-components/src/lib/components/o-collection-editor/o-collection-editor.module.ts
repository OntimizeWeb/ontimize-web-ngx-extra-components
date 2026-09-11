import { NgModule } from '@angular/core';
import { OCollectionEditorComponent } from './o-collection-editor.component';
import { OCollectionGroupFieldsDirective, OCollectionItemDirective } from '../../directives';

@NgModule({
  imports: [OCollectionEditorComponent, OCollectionGroupFieldsDirective, OCollectionItemDirective],
  exports: [OCollectionEditorComponent, OCollectionGroupFieldsDirective, OCollectionItemDirective]
})
export class OCollectionEditorModule { }
