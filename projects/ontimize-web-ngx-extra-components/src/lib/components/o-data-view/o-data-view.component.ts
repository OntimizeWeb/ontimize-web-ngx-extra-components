import { Component, ContentChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OConfigureServiceArgs } from 'ontimize-web-ngx';
import { ODataViewGridItemDirective } from './o-data-view-grid-item.directive';
import { ODataViewListItemDirective } from './o-data-view-list-item.directive';
import { ODataViewMode } from './o-data-view.types';

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html'
})
export class ODataViewComponent implements OnChanges {

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewListItemDirective)
  listItemTpl?: ODataViewListItemDirective;

  @Input('default-view') defaultView?: ODataViewMode;

  protected currentView: ODataViewMode = 'table';

  @Input() attr?: string;
  @Input() columns?: string;
  @Input('configure-service-args') configureServiceArgs?: OConfigureServiceArgs;
  @Input() entity?: string;
  @Input() keys?: string;
  @Input() pageable?: string;
  @Input('paginated-query-method') paginatedQueryMethod?: string;
  @Input('parent-keys') parentKeys?: string;
  @Input('query-fallback-function') queryFallbackFunction?: Function;
  @Input('query-method') queryMethod?: string;
  @Input('query-on-bind') queryOnBind?: string;
  @Input('query-on-init') queryOnInit?: string;
  @Input('query-rows') queryRows?: number;
  @Input('query-with-null-parent-keys') queryWithNullParentKeys?: string;
  @Input() service?: string;
  @Input('service-type') serviceType?: string;
  @Input('static-data') staticData?: any[];
  @Input('store-state') storeState?: string;


  r_attr?: string;
  r_columns?: string;
  r_configureServiceArgs?: OConfigureServiceArgs;
  r_entity?: string;
  r_keys?: string;
  r_pageable!: string;
  r_paginatedQueryMethod?: string;
  r_parentKeys?: string;
  r_queryFallbackFunction?: Function;
  r_queryMethod?: string;
  r_queryOnBind!: string;
  r_queryOnInit!: string;
  r_queryRows?: number;
  r_queryWithNullParentKeys!: string;
  r_service?: string;
  r_serviceType?: string;
  r_staticData?: any[];
  r_storeState!: string;


  changeView($event): void {
    this.currentView = $event.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultView']) {
      this.currentView = this.defaultView ?? 'table';
    }
    this.resolveCommonInputs();
  }

  private resolveCommonInputs(): void {
    this.r_columns = this.setDefaultValue(this.columns, undefined);
    this.r_keys = this.setDefaultValue(this.keys, undefined);
    this.r_attr = this.setDefaultValue(this.attr, undefined);
    this.r_entity = this.setDefaultValue(this.entity, undefined);
    this.r_service = this.setDefaultValue(this.service, undefined);
    this.r_serviceType = this.setDefaultValue(this.serviceType, undefined);
    this.r_paginatedQueryMethod = this.setDefaultValue(this.paginatedQueryMethod, 'advancedQuery');
    this.r_parentKeys = this.setDefaultValue(this.parentKeys, undefined);
    this.r_queryMethod = this.setDefaultValue(this.queryMethod, 'query');
    this.r_configureServiceArgs = this.configureServiceArgs;
    this.r_queryFallbackFunction = this.queryFallbackFunction;
    this.r_staticData = this.staticData;
    this.r_pageable = this.setDefaultValue(this.pageable, 'no');
    this.r_queryOnInit = this.setDefaultValue(this.queryOnInit, 'yes');
    this.r_queryOnBind = this.setDefaultValue(this.queryOnBind, 'yes');
    this.r_queryWithNullParentKeys = this.setDefaultValue(this.queryWithNullParentKeys, 'no');
    this.r_storeState = this.setDefaultValue(this.storeState, 'yes');
    const queryRows_string = this.setDefaultValue(this.queryRows?.toString(), '10');
    this.r_queryRows = Number(queryRows_string);
  }

  private setDefaultValue(v: string | undefined | null | '' , def: string | undefined): string | undefined {
    if (v === undefined || v === null || v === '') return def;
    return v;
  }

}
