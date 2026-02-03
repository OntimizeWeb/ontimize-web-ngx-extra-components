import 'zone.js';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ontimizePostBootstrap } from 'ontimize-web-ngx';

import { AppModule } from './app/app.module';

const promise = platformBrowserDynamic().bootstrapModule(AppModule);
promise.then(ontimizePostBootstrap).catch(err => {
  console.error(err.message);
});
