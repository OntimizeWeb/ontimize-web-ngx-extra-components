import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataViewTestComponent } from './data-view/data-view-test.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'data-view', component: DataViewTestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
