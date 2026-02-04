import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataViewTestComponent } from './data-view/data-view-test.component';
import { ImageEditorTestComponent } from './image-editor/image-editor-test.component';

const routes: Routes = [
  { path: '', redirectTo: 'data-view', pathMatch: 'full' },
  { path: 'data-view', component: DataViewTestComponent },
  { path: 'image-editor', component: ImageEditorTestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
