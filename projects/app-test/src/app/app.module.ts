import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { OExtraComponentsModule } from 'ontimize-web-ngx-extra-components';
import { APP_CONFIG, ONTIMIZE_PROVIDERS, OntimizeWebModule } from 'ontimize-web-ngx';
import { CONFIG } from './app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataViewTestModule } from './data-view/data-view-test.module';
import { ImageEditorTestModule } from './image-editor/image-editor-test.module';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    OExtraComponentsModule,
    OntimizeWebModule,
    OntimizeWebModule.forRoot(CONFIG),
    DataViewTestModule,
    ImageEditorTestModule
  ],
  providers: [
    { provide: APP_CONFIG, useValue: CONFIG },
    ...ONTIMIZE_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
