import { Config } from 'ontimize-web-ngx';
import { SERVICE_CONFIG } from './app.services.config';

export const CONFIG: Config = {
  apiEndpoint: 'http://localhost:8080',
  uuid: 'com.ontimize.web.ngx.data-view-app-test',
  title: 'Data View App Test',
  locale: 'en',
  applicationLocales: ['en'],
  servicesConfiguration: SERVICE_CONFIG
};
