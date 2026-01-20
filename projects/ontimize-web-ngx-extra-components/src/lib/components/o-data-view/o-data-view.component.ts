import { AfterViewInit, Component, ContentChild, EmbeddedViewRef, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FilterExpression, O_TABLE_GLOBAL_CONFIG, OButtonToggleGroupComponent, OConfigureServiceArgs, OTableColumnComponent, OTableComponent, OTableGlobalConfig, Util } from 'ontimize-web-ngx';
import { ODataViewGridItemDirective } from '../../directives/o-data-view-grid-item.directive';
import { TableConfig } from '../../interfaces/table-config.interface';
import { GridConfig } from '../../interfaces/grid-config.interface';
import { ODataViewTableColumnsDirective } from '../../directives/o-data-view-table-columns.directive';
import { ODataViewMode } from '../../types/data-view.types';

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss']
})

export class ODataViewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('table', { static: false }) table: OTableComponent;
  @ViewChild('toggleGroup') toggleGroup: OButtonToggleGroupComponent;

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewTableColumnsDirective)
  tableTpl?: ODataViewTableColumnsDirective;

  @Input('default-view') defaultView?: ODataViewMode;
  @Input('toggle-on-toolbar') toggleOnToolbar?: string;
  @Input('toggle-floatable') toggleFloatable?: string;
  @Input('toggle-button') toggleButton?: string;

  protected showToggleOnToolbar: boolean = false;
  protected showToggleFloatable: boolean = false;
  protected showToggleButton: boolean = true;

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

  r_grid_controls?: string;
  r_grid_detailFormRoute?: string;
  r_grid_detailMode?: string;
  r_grid_enabled?: string;
  r_grid_quickFilter?: string;
  r_grid_quickFilterPlaceholder?: string;
  r_grid_quickFilterAppearance?: string;
  r_grid_recursiveDetail?: string;
  r_grid_title?: string;
  r_grid_visible?: string;
  r_grid_cols?: number;
  r_grid_fixedHeader?: string;
  r_grid_gridItemHeight?: string | number;
  r_grid_gutterSize?: string;
  r_grid_insertButton?: string;
  r_grid_insertButtonFloatable?: string;
  r_grid_insertButtonPosition?: string;
  r_grid_orderable?: string;
  r_grid_pageSizeOptions?: any[];
  r_grid_paginationControls?: string;
  r_grid_quickFilterColumns?: string;
  r_grid_refreshButton?: string;
  r_grid_showButtonsText?: string;
  r_grid_showFooter?: string;
  r_grid_showPageSize?: string;
  r_grid_sortColumn?: string;
  r_grid_sortableColumns?: string;

  private columnsView: EmbeddedViewRef<any> | null = null;

  constructor(
    private vcr: ViewContainerRef,
    @Optional() @Inject(O_TABLE_GLOBAL_CONFIG) private tableGlobalConfig?: OTableGlobalConfig
  ) { }

  ngOnInit(): void {
    if (!this.defaultView) this.defaultView = 'table';
    this.showToggleOnToolbar = Util.parseBoolean(this.toggleOnToolbar, false);
    this.showToggleFloatable = Util.parseBoolean(this.toggleFloatable, false);
    this.showToggleButton = Util.parseBoolean(this.toggleButton, true);
  }

  ngAfterViewInit(): void {
    // Register columns only if they exist and we're in table view
    if (this.tableTpl && this.table) {
      this.registerTableColumns();
    }
  }

  ngOnDestroy(): void {
    // Clean up the created view to avoid memory leaks
    if (this.columnsView) {
      this.columnsView.destroy();
      this.columnsView = null;
    }
  }

  private registerTableColumns(): void {
    if (!this.tableTpl || !this.table?.injector) {
      return;
    }
    try {
      // Create the embedded view with the correct injector
      this.columnsView = this.vcr.createEmbeddedView(
        this.tableTpl.templateRef,
        {},
        { injector: this.table.injector }
      );

      // Detect changes to ensure nodes are fully initialized
      this.columnsView.detectChanges();

      // Filter and register only OTableColumnComponent instances
      const columns = this.columnsView.rootNodes
        .filter(node => node instanceof OTableColumnComponent) as OTableColumnComponent[];

      if (columns.length === 0) {
        console.warn('No columns found to register in o-data-view');
      }

      columns.forEach((column: OTableColumnComponent) => {
        if (this.table && typeof this.table.registerColumn === 'function') {
          this.table.registerColumn(column);
        }
      });

      // Force change detection in the table after registering columns
      if (this.table && typeof (this.table as any).cd?.detectChanges === 'function') {
        (this.table as any).cd.detectChanges();
      }

    } catch (error) {
      console.error('Error registering table columns:', error);
    }
  }

  public changeView(value: ODataViewMode): void {
    const previousView = this.defaultView;

    if (this.toggleGroup) {
      this.defaultView = this.toggleGroup.getValue();
    } else {
      this.defaultView = value;
    }

    // If switching to table and columns aren't registered, register them
    if (this.defaultView === 'table' && previousView !== 'table') {
      setTimeout(() => this.registerTableColumns(), 0);
    }
  }

  ngOnChanges(): void {
    this.resolveCommonInputs();
    this.resolveTableInputs();
    this.resolveGridInputs();
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
    this.r_queryRows = this.setDefaultNumber(this.queryRows, 10);
    this.r_deleteMethod = this.setDefaultValue(this.deleteMethod, 'delete');
    this.r_insertMethod = this.setDefaultValue(this.insertMethod, 'insert');
    this.r_updateMethod = this.setDefaultValue(this.updateMethod, 'update');
  }

  private resolveTableInputs(): void {
    const cfg = this.tableConfig ?? {};
    const g = this.tableGlobalConfig;

    this.r_table_controls = this.setDefaultValue(cfg.controls, 'yes');
    this.r_table_detailButtonInRow = this.setDefaultValue(cfg.detailButtonInRow, 'no');
    this.r_table_detailButtonInRowIcon = this.setDefaultValue(cfg.detailButtonInRowIcon, 'search');
    this.r_table_detailFormRoute = this.setDefaultValue(cfg.detailFormRoute, 'detail');
    this.r_table_detailMode = this.resolveStringWithGlobal(cfg.detailMode, g?.detailMode, 'click');
    this.r_table_editButtonInRow = this.setDefaultValue(cfg.editButtonInRow, 'no');
    this.r_table_editButtonInRowIcon = this.setDefaultValue(cfg.editButtonInRowIcon, 'edit');
    this.r_table_editFormRoute = this.setDefaultValue(cfg.editFormRoute, 'edit');
    this.r_table_enabled = this.setDefaultValue(cfg.enabled, 'yes');
    this.r_table_filterCaseSensitive = this.setDefaultValue(cfg.filterCaseSensitive, 'no');
    this.r_table_insertButton = this.setDefaultValue(cfg.insertButton, 'yes');
    this.r_table_insertFormRoute = this.setDefaultValue(cfg.insertFormRoute, 'new');
    this.r_table_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, [10, 25, 50, 100]);
    this.r_table_paginationControls = this.setDefaultValue(cfg.paginationControls, 'yes');
    this.r_table_quickFilter = this.setDefaultValue(cfg.quickFilter, 'yes');
    this.r_table_quickFilterPlaceholder = this.setDefaultValue(cfg.quickFilterPlaceholder, undefined);
    this.r_table_recursiveDetail = this.setDefaultValue(cfg.recursiveDetail, 'no');
    this.r_table_recursiveEdit = this.setDefaultValue(cfg.recursiveEdit, 'no');
    this.r_table_recursiveInsert = this.setDefaultValue(cfg.recursiveInsert, 'no');
    this.r_table_rowHeight = this.resolveStringWithGlobal(cfg.rowHeight, g?.rowHeight, 'medium');
    this.r_table_title = this.setDefaultValue(cfg.title, undefined);
    this.r_table_visible = this.setDefaultValue(cfg.visible, 'yes');

    this.r_table_autoAdjust = this.resolveYesNoWithGlobal(cfg.autoAdjust, g?.autoAdjust, 'yes');
    this.r_table_autoAlignTitles = this.resolveYesNoWithGlobal(cfg.autoAlignTitles, g?.autoAlignTitles, 'yes');
    this.r_table_collapseGroupedColumns = this.setDefaultValue(cfg.collapseGroupedColumns, 'no');
    this.r_table_columnsVisibilityButton = this.setDefaultValue(cfg.columnsVisibilityButton, 'yes');
    this.r_table_defaultVisibleColumns = this.setDefaultValue(cfg.defaultVisibleColumns, undefined);
    this.r_table_deleteButton = this.setDefaultValue(cfg.deleteButton, 'yes');
    this.r_table_editionMode = this.resolveStringWithGlobal(cfg.editionMode, g?.editionMode, 'none');
    this.r_table_exportButton = this.setDefaultValue(cfg.exportButton, 'yes');
    this.r_table_exportServiceType = this.setDefaultValue(cfg.exportServiceType, 'OntimizeExportService');
    this.r_table_filterColumnActiveByDefault = this.resolveYesNoWithGlobal(
      cfg.filterColumnActiveByDefault,
      g?.filterColumnActiveByDefault,
      'yes'
    );
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

  private resolveGridInputs(): void {
    const cfg = this.gridConfig ?? {};

    this.r_grid_controls = this.setDefaultValue(cfg.controls, 'yes');
    this.r_grid_detailFormRoute = this.setDefaultValue(cfg.detailFormRoute, 'detail');
    this.r_grid_detailMode = this.setDefaultValue(cfg.detailMode, 'click');
    this.r_grid_enabled = this.setDefaultValue(cfg.enabled, 'yes');
    this.r_grid_quickFilter = this.setDefaultValue(cfg.quickFilter, 'yes');
    this.r_grid_quickFilterAppearance = this.setDefaultValue(cfg.quickFilterAppearance, 'outline');
    this.r_grid_quickFilterPlaceholder = this.setDefaultValue(cfg.quickFilterPlaceholder, undefined);
    this.r_grid_recursiveDetail = this.setDefaultValue(cfg.recursiveDetail, 'no');
    this.r_grid_title = this.setDefaultValue(cfg.title, undefined);
    this.r_grid_visible = this.setDefaultValue(cfg.visible, 'yes');
    this.r_grid_cols = cfg.cols;
    this.r_grid_fixedHeader = this.setDefaultValue(cfg.fixedHeader, 'no');
    this.r_grid_gridItemHeight = this.setDefaultValueAny<string | number>(cfg?.gridItemHeight, '1:1');
    this.r_grid_gutterSize = this.setDefaultValue(cfg.gutterSize, '1px');
    this.r_grid_insertButton = this.setDefaultValue(cfg.insertButton, 'false');
    this.r_grid_insertButtonFloatable = this.setDefaultValue(cfg.insertButtonFloatable, 'yes');
    this.r_grid_insertButtonPosition = this.setDefaultValue(cfg.insertButtonPosition, 'bottom');
    this.r_grid_orderable = this.setDefaultValue(cfg.orderable, 'no');
    this.r_grid_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, [8, 16, 24, 32, 64]);
    this.r_grid_paginationControls = this.setDefaultValue(cfg.paginationControls, 'no');
    this.r_grid_quickFilterColumns = this.setDefaultValue(cfg.quickFilterColumns, this.r_columns);
    this.r_grid_refreshButton = this.setDefaultValue(cfg.refreshButton, 'yes');
    this.r_grid_showButtonsText = this.setDefaultValue(cfg.showButtonsText, 'no');
    this.r_grid_showFooter = this.setDefaultValue(cfg.showFooter, 'true');
    this.r_grid_showPageSize = this.setDefaultValue(cfg.showPageSize, 'no');
    this.r_grid_sortColumn = this.setDefaultValue(cfg.sortColumn, undefined);
    this.r_grid_sortableColumns = this.setDefaultValue(cfg.sortableColumns, undefined);
  }

  private setDefaultValue(v: string | undefined | null | '', def: string | undefined): string | undefined {
    if (v === undefined || v === null || v === '') return def;
    return v;
  }

  private setDefaultValueAny<T>(v: T | undefined | null, def: T | undefined): T | undefined {
    if (v === undefined || v === null) return def;
    if (typeof v === 'string' && v === '') return def;
    return v;
  }

  private setDefaultNumber(v: number | undefined | null, def: number | undefined): number | undefined {
    if (v === undefined || v === null) return def;
    return v;
  }

  private setDefaultArray(v: any[], def: any[] | undefined): any[] | undefined {
    if (v === undefined || v === null) return def;
    return v;
  }

  private resolveYesNoWithGlobal(
    inputVal: string | undefined | null | '',
    globalVal: boolean | undefined | null,
    defaultVal: string
  ): string {
    const inputResolved = this.setDefaultValue(inputVal, undefined);
    if (inputResolved !== undefined) return inputResolved;

    if (globalVal !== undefined && globalVal !== null) {
      return globalVal ? 'yes' : 'no';
    }

    return defaultVal;
  }

  private resolveStringWithGlobal(
    inputVal: string | undefined | null | '',
    globalVal: string | undefined | null,
    defaultVal: string
  ): string {
    const inputResolved = this.setDefaultValue(inputVal, undefined);
    if (inputResolved !== undefined) return inputResolved;

    const globalResolved = this.setDefaultValue(globalVal as any, undefined);
    if (globalResolved !== undefined) return globalResolved;

    return defaultVal;
  }

}
