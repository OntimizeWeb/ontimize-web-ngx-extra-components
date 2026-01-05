import { Component, ContentChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FilterExpression, OConfigureServiceArgs } from 'ontimize-web-ngx';
import { ODataViewGridItemDirective } from './o-data-view-grid-item.directive';
import { ODataViewListItemDirective } from './o-data-view-list-item.directive';
import { TableConfig } from './table-config.types';
import { GridConfig } from './grid-config.types';
import { ListConfig } from './list-config.types';
import { ODataViewTableColumnsDirective } from './o-data-view-table-columns.directive';

export type ODataViewMode = 'table' | 'grid' | 'list';
@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html'
})

export class ODataViewComponent implements OnChanges {

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewListItemDirective)
  listItemTpl?: ODataViewListItemDirective;

  @ContentChild(ODataViewTableColumnsDirective)
  tableTpl?: ODataViewTableColumnsDirective;

  @Input('default-view') defaultView?: ODataViewMode;

  protected currentView: ODataViewMode = 'table';

  @Input() attr?: string;
  @Input() columns?: string;
  @Input('configure-service-args') configureServiceArgs?: OConfigureServiceArgs;
  @Input('delete-method') deleteMethod?: string;
  @Input() entity?: string;
  @Input('insert-method') insertMethod?: string;
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
  @Input('update-method') updateMethod?: string;

  @Input('table-config') tableConfig?: TableConfig;
  @Input('grid-config') gridConfig?: GridConfig;
  @Input('list-config') listConfig?: ListConfig;


  r_attr?: string;
  r_columns?: string;
  r_configureServiceArgs?: OConfigureServiceArgs;
  r_deleteMethod?: string;
  r_entity?: string;
  r_insertMethod?: string;
  r_keys?: string;
  r_pageable?: string;
  r_paginatedQueryMethod?: string;
  r_parentKeys?: string;
  r_queryFallbackFunction?: Function;
  r_queryMethod?: string;
  r_queryOnBind?: string;
  r_queryOnInit?: string;
  r_queryRows?: number;
  r_queryWithNullParentKeys?: string;
  r_service?: string;
  r_serviceType?: string;
  r_staticData?: any[];
  r_storeState?: string;
  r_updateMethod?: string;

  r_table_controls?: string;
  r_table_detailButtonInRow?: string;
  r_table_detailButtonInRowIcon?: string;
  r_table_detailFormRoute?: string;
  r_table_detailMode?: string;
  r_table_editButtonInRow?: string;
  r_table_editButtonInRowIcon?: string;
  r_table_editFormRoute?: string;
  r_table_enabled?: string;
  r_table_filterCaseSensitive?: string;
  r_table_insertButton?: string;
  r_table_insertFormRoute?: string;
  r_table_pageSizeOptions?: any[];
  r_table_paginationControls?: string;
  r_table_quickFilter?: string;
  r_table_quickFilterPlaceholder?: string;
  r_table_recursiveDetail?: string;
  r_table_recursiveEdit?: string;
  r_table_recursiveInsert?: string;
  r_table_rowHeight?: string;
  r_table_title?: string;
  r_table_visible?: string;
  r_table_autoAdjust?: string;
  r_table_autoAlignTitles?: string;
  r_table_collapseGroupedColumns?: string;
  r_table_columnsVisibilityButton?: string;
  r_table_defaultVisibleColumns?: string;
  r_table_deleteButton?: string;
  r_table_editionMode?: string;
  r_table_exportButton?: string;
  r_table_exportServiceType?: string;
  r_table_filterColumnActiveByDefault?: string;
  r_table_fixedHeader?: string;
  r_table_groupable?: string;
  r_table_groupedColumns?: string;
  r_table_horizontalScroll?: string;
  r_table_keepSelectedItems?: string;
  r_table_multipleSort?: string;
  r_table_nonHidableColumns?: string;
  r_table_refreshButton?: string;
  r_table_resizable?: string;
  r_table_selectAllCheckbox?: string;
  r_table_selectAllCheckboxVisible?: string;
  r_table_selectionMode?: string;
  r_table_showButtonsText?: string;
  r_table_showConfigurationOption?: string;
  r_table_showFilterOption?: string;
  r_table_showPaginatorFirstLastButtons?: string;
  r_table_showReportOnDemandOption?: string;
  r_table_showResetWidthOption?: string;
  r_table_showTitle?: string;
  r_table_sortColumns?: string;
  r_table_virtualScroll?: string;
  r_table_visibleColumns?: string;
  r_table_visibleExportDialogButtons?: string;
  r_table_disableSelectionFunction?: (item: any) => boolean;
  r_table_quickFilterFunction?: (filter: string) => FilterExpression | Object;
  r_table_rowClass?: (rowData: any, rowIndex: number) => string | string[];
  r_table_showExpandableIconFunction?: Function;


  changeView($event): void {
    this.currentView = $event.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultView']) {
      this.currentView = this.defaultView ?? 'table';
    }
    this.resolveCommonInputs();
    this.resolveTableInputs();
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
    this.r_deleteMethod = this.setDefaultValue(this.deleteMethod, 'delete');
    this.r_insertMethod = this.setDefaultValue(this.insertMethod, 'insert');
    this.r_updateMethod = this.setDefaultValue(this.updateMethod, 'update');
  }

  private resolveTableInputs(): void {
    const cfg = this.tableConfig ?? {};

    this.r_table_controls = this.setDefaultValue(cfg.controls, 'yes');
    this.r_table_detailButtonInRow = this.setDefaultValue(cfg.detailButtonInRow, 'no');
    this.r_table_detailButtonInRowIcon = this.setDefaultValue(cfg.detailButtonInRowIcon, 'search');
    this.r_table_detailFormRoute = this.setDefaultValue(cfg.detailFormRoute, 'detail');
    this.r_table_detailMode = this.setDefaultValue(cfg.detailMode, 'click');
    this.r_table_editButtonInRow = this.setDefaultValue(cfg.editButtonInRow, 'no');
    this.r_table_editButtonInRowIcon = this.setDefaultValue(cfg.editButtonInRowIcon, 'edit');
    this.r_table_editFormRoute = this.setDefaultValue(cfg.editFormRoute, 'edit');
    this.r_table_enabled = this.setDefaultValue(cfg.enabled, 'yes');
    this.r_table_filterCaseSensitive = this.setDefaultValue(cfg.filterCaseSensitive, 'no');
    this.r_table_insertButton = this.setDefaultValue(cfg.insertButton, 'yes');
    this.r_table_insertFormRoute = this.setDefaultValue(cfg.insertFormRoute, 'new');
    this.r_table_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, [10,25,50,100]);
    this.r_table_paginationControls = this.setDefaultValue(cfg.paginationControls, 'yes');
    this.r_table_quickFilter = this.setDefaultValue(cfg.quickFilter, 'yes');
    this.r_table_quickFilterPlaceholder = this.setDefaultValue(cfg.quickFilterPlaceholder, undefined);
    this.r_table_recursiveDetail = this.setDefaultValue(cfg.recursiveDetail, 'no');
    this.r_table_recursiveEdit = this.setDefaultValue(cfg.recursiveEdit, 'no');
    this.r_table_recursiveInsert = this.setDefaultValue(cfg.recursiveInsert, 'no');
    this.r_table_rowHeight = this.setDefaultValue(cfg.rowHeight, 'medium');
    this.r_table_title = this.setDefaultValue(cfg.title, undefined);
    this.r_table_visible = this.setDefaultValue(cfg.visible, 'yes');

    this.r_table_autoAdjust = this.setDefaultValue(cfg.autoAdjust, 'yes');
    this.r_table_autoAlignTitles = this.setDefaultValue(cfg.autoAlignTitles, 'yes');
    this.r_table_collapseGroupedColumns = this.setDefaultValue(cfg.collapseGroupedColumns, 'no');
    this.r_table_columnsVisibilityButton = this.setDefaultValue(cfg.columnsVisibilityButton, 'yes');
    this.r_table_defaultVisibleColumns = this.setDefaultValue(cfg.defaultVisibleColumns, undefined);
    this.r_table_deleteButton = this.setDefaultValue(cfg.deleteButton, 'yes');
    this.r_table_editionMode = this.setDefaultValue(cfg.editionMode, 'none');
    this.r_table_exportButton = this.setDefaultValue(cfg.exportButton, 'yes');
    this.r_table_exportServiceType = this.setDefaultValue(cfg.exportServiceType, 'OntimizeExportService');
    this.r_table_filterColumnActiveByDefault = this.setDefaultValue(cfg.filterColumnActiveByDefault, 'yes');
    this.r_table_fixedHeader = this.setDefaultValue(cfg.fixedHeader, 'yes');
    this.r_table_groupable = this.setDefaultValue(cfg.groupable, 'no');
    this.r_table_groupedColumns = this.setDefaultValue(cfg.groupedColumns, undefined);
    this.r_table_horizontalScroll = this.setDefaultValue(cfg.horizontalScroll, 'no');
    this.r_table_multipleSort = this.setDefaultValue(cfg.multipleSort, 'yes');
    this.r_table_nonHidableColumns = this.setDefaultValue(cfg.nonHidableColumns, undefined);
    this.r_table_refreshButton = this.setDefaultValue(cfg.refreshButton, 'yes');
    this.r_table_resizable = this.setDefaultValue(cfg.resizable, 'yes');
    this.r_table_selectAllCheckbox = this.setDefaultValue(cfg.selectAllCheckbox, 'no');
    this.r_table_selectAllCheckboxVisible = this.setDefaultValue(cfg.selectAllCheckboxVisible, 'no');
    this.r_table_selectionMode = this.setDefaultValue(cfg.selectionMode, 'multiple');
    this.r_table_showButtonsText = this.setDefaultValue(cfg.showButtonsText, 'yes');
    this.r_table_showConfigurationOption = this.setDefaultValue(cfg.showConfigurationOption, 'yes');
    this.r_table_showFilterOption = this.setDefaultValue(cfg.showFilterOption, 'yes');
    this.r_table_showPaginatorFirstLastButtons = this.setDefaultValue(cfg.showPaginatorFirstLastButtons, 'yes');
    this.r_table_showReportOnDemandOption = this.setDefaultValue(cfg.showReportOnDemandOption, 'yes');
    this.r_table_showResetWidthOption = this.setDefaultValue(cfg.showResetWidthOption, 'yes');
    this.r_table_showTitle = this.setDefaultValue(cfg.showTitle, 'no');
    this.r_table_sortColumns = this.setDefaultValue(cfg.sortColumns, undefined);
    this.r_table_virtualScroll = this.setDefaultValue(cfg.virtualScroll, 'yes');
    this.r_table_visibleColumns = this.setDefaultValue(cfg.visibleColumns, undefined);
    this.r_table_visibleExportDialogButtons = this.setDefaultValue(cfg.visibleExportDialogButtons, undefined);

    this.r_table_disableSelectionFunction = cfg.disableSelectionFunction;
    this.r_table_quickFilterFunction = cfg.quickFilterFunction;
    this.r_table_rowClass = cfg.rowClass;
    this.r_table_showExpandableIconFunction = cfg.showExpandableIconFunction;
  }


  private setDefaultValue(v: string | undefined | null | '', def: string | undefined): string | undefined {
    if (v === undefined || v === null || v === '') return def;
    return v;
  }

  private setDefaultArray(v: any[], def: any[] | undefined): any[] | undefined {
    if (v === undefined || v === null ) return def;
    return v;
  }

}
