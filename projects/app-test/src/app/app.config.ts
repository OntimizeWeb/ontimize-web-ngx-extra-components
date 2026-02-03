import { Config } from 'ontimize-web-ngx';
import { SERVICE_CONFIG } from './app.services.config';
import { MENU_CONFIG } from './app.menu.config';

export const CONFIG: Config = {
  apiEndpoint: '',
  uuid: 'com.ontimize.web.ngx.app-test',
  title: 'App Test',
  locale: 'en',
  applicationLocales: ['en'],
  servicesConfiguration: SERVICE_CONFIG,
  appMenuConfiguration: MENU_CONFIG
};
