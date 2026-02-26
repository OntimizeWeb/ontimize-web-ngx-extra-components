import { AfterViewInit, Component, ContentChild, EmbeddedViewRef, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { BooleanInputConverter, Codes, FilterExpression, O_TABLE_GLOBAL_CONFIG, OButtonToggleGroupComponent, OConfigureServiceArgs, OGridComponent, OTableComponent, OTableGlobalConfig, Util } from 'ontimize-web-ngx';
import { TableConfig } from '../../interfaces/table-config.interface';
import { GridConfig } from '../../interfaces/grid-config.interface';
import { ODataViewTableColumnsDirective, ODataViewGridItemDirective } from '../../directives';
import { ODataViewMode } from '../../types/data-view.types';

export const DEFAULT_INPUTS_O_DATA_VIEW = [
  'toggleButton: toggle-button',
  'toggleOnToolbar: toggle-on-toolbar',
  'toggleFloatable: toggle-floatable'
];

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  inputs: DEFAULT_INPUTS_O_DATA_VIEW
})

export class ODataViewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('table', { static: false }) table: OTableComponent;
  @ViewChild('grid') grid: OGridComponent;
  @ViewChild('toggleGroup') toggleGroup: OButtonToggleGroupComponent;

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewTableColumnsDirective)
  tableTpl?: ODataViewTableColumnsDirective;

  @Input('default-view') defaultView?: ODataViewMode;

  @BooleanInputConverter()
  public toggleButton = true;

  @BooleanInputConverter()
  public toggleOnToolbar = false;

  @BooleanInputConverter()
  public toggleFloatable = false;

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
  @Input('show-buttons-text') showButtonsText?: string;
  @Input('quick-filter-placeholder') quickFilterPlaceholder?: string;
  @Input('insert-button') insertButton?: string;
  @Input('refresh-button') refreshButton?: string;
  @Input('fixed-header') fixedHeader?: string;
  @Input() controls?: string;
  @Input() title?: string;
  @Input('quick-filter') quickFilter?: string;
  @Input('quick-filter-appearance') quickFilterAppearance?: string;
  @Input('recursive-detail') recursiveDetail?: string;
  @Input('recursive-edit') recursiveEdit?: string;
  @Input('recursive-insert') recursiveInsert?: string;
  @Input('detail-form-route') detailFormRoute?: string;
  @Input('pagination-controls') paginationControls?: string;
  @Input('insert-form-route') insertFormRoute?: string;
  @Input('filter-case-sensitive') filterCaseSensitive?: string;
  @Input('delete-button') deleteButton?: string;

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
  r_showButtonsText?: string;
  r_quickFilterPlaceholder?: string;
  r_insertButton?: string;
  r_refreshButton?: string;
  r_fixedHeader?: string;
  r_controls?: string;
  r_title?: string;
  r_quickFilter?: string;
  r_quickFilterAppearance?: string;
  r_quickFilterColumns?: string;
  r_recursiveDetail?: string;
  r_recursiveEdit?: string;
  r_recursiveInsert?: string;
  r_detailFormRoute?: string;
  r_paginationControls?: string;
  r_insertFormRoute?: string;
  r_filterCaseSensitive?: string;
  r_deleteButton?: string;

  r_table_detailButtonInRow?: string;
  r_table_detailButtonInRowIcon?: string;
  r_table_detailMode?: string;
  r_table_editButtonInRow?: string;
  r_table_editButtonInRowIcon?: string;
  r_table_editFormRoute?: string;
  r_table_enabled?: string;
  r_table_rowHeight?: string;
  r_table_visible?: string;
  r_table_autoAdjust?: string;
  r_table_autoAlignTitles?: string;
  r_table_collapseGroupedColumns?: string;
  r_table_columnsVisibilityButton?: string;
  r_table_defaultVisibleColumns?: string;
  r_table_editionMode?: string;
  r_table_exportButton?: string;
  r_table_exportServiceType?: string;
  r_table_filterColumnActiveByDefault?: string;
  r_table_groupable?: string;
  r_table_groupedColumns?: string;
  r_table_horizontalScroll?: string;
  r_table_keepSelectedItems?: string;
  r_table_multipleSort?: string;
  r_table_nonHidableColumns?: string;
  r_table_resizable?: string;
  r_table_selectAllCheckbox?: string;
  r_table_selectAllCheckboxVisible?: string;
  r_table_selectionMode?: string;
  r_table_showConfigurationOption?: string;
  r_table_showFilterOption?: string;
  r_table_showPaginatorFirstLastButtons?: string;
  r_table_showReportOnDemandOption?: string;
  r_table_showChartsOnDemandOption?: string;
  r_table_showResetWidthOption?: string;
  r_table_sortColumns?: string;
  r_table_virtualScroll?: string;
  r_table_visibleColumns?: string;
  r_table_visibleExportDialogButtons?: string;
  r_table_disableSelectionFunction?: (item: any) => boolean;
  r_table_quickFilterFunction?: (filter: string) => FilterExpression | Object;
  r_table_rowClass?: (rowData: any, rowIndex: number) => string | string[];
  r_table_showExpandableIconFunction?: Function;
  r_table_selectionOnRowClick?: string;
  r_table_pageSizeOptions?: any[];

  r_grid_detailMode?: string;
  r_grid_enabled?: string;
  r_grid_visible?: string;
  r_grid_cols?: number;
  r_grid_gridItemHeight?: string | number;
  r_grid_gutterSize?: string;
  r_grid_insertButtonFloatable?: string;
  r_grid_insertButtonPosition?: string;
  r_grid_orderable?: string;
  r_grid_showFooter?: string;
  r_grid_showPageSize?: string;
  r_grid_sortColumn?: string;
  r_grid_sortableColumns?: string;
  r_grid_pageSizeOptions?: any[];
  r_grid_quickFilterColumns?: string;

  private columnsView: EmbeddedViewRef<any> | null = null;

  constructor(
    private readonly vcr: ViewContainerRef,
    @Optional() @Inject(O_TABLE_GLOBAL_CONFIG) private readonly tableGlobalConfig?: OTableGlobalConfig
  ) { }

  ngOnInit(): void {
    if (!this.defaultView) this.defaultView = 'table';
  }

  get inlineToggleVisible(): boolean {
    return this.toggleButton && !this.toggleFloatable && !this.toggleOnToolbar;
  }

  get toolbarToggleVisible(): boolean {
    return this.toggleButton && !this.toggleFloatable && this.toggleOnToolbar;
  }

  get floatableToggleVisible(): boolean {
    return this.toggleButton && this.toggleFloatable;
  }

  ngAfterViewInit(): void {
    // Initialize and synchronize table columns once the view and projected content are ready
    if (this.tableTpl && this.table) {
      this.syncTableColumnsWithTable();
    }
  }

  ngOnDestroy(): void {
    // Clean up the created view to avoid memory leaks
    if (this.columnsView) {
      this.columnsView.destroy();
      this.columnsView = null;
    }
  }

  private syncTableColumnsWithTable(): void {
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
       setTimeout(() => {
         this.table.parseVisibleColumns(true);
         if (Util.isDefined(this.table.oTableColumnsGroupingComponent)) {
           this.table.setGroupColumns(this.table.oTableColumnsGroupingComponent.columnsArray);
         }
       }, 0);

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
      setTimeout(() => this.syncTableColumnsWithTable(), 0);
    }
  }

  ngOnChanges(): void {
    this.resolveCommonInputs();
    this.resolveTableInputs();
    this.resolveGridInputs();
  }

  private resolveCommonInputs(): void {
    this.r_columns = this.setDefaultValue(this.columns, '');
    this.r_keys = this.setDefaultValue(this.keys, '');
    this.r_attr = this.setDefaultValue(this.attr, '');
    this.r_entity = this.setDefaultValue(this.entity, '');
    this.r_service = this.setDefaultValue(this.service, '');
    this.r_serviceType = this.setDefaultValue(this.serviceType, '');
    this.r_paginatedQueryMethod = this.setDefaultValue(this.paginatedQueryMethod, Codes.PAGINATED_QUERY_METHOD);
    this.r_parentKeys = this.setDefaultValue(this.parentKeys, '');
    this.r_queryMethod = this.setDefaultValue(this.queryMethod, Codes.QUERY_METHOD);
    this.r_configureServiceArgs = this.configureServiceArgs;
    this.r_queryFallbackFunction = this.queryFallbackFunction;
    this.r_staticData = this.staticData;
    this.r_pageable = this.setDefaultValue(this.pageable, 'no');
    this.r_queryOnInit = this.setDefaultValue(this.queryOnInit, 'yes');
    this.r_queryOnBind = this.setDefaultValue(this.queryOnBind, 'yes');
    this.r_queryWithNullParentKeys = this.setDefaultValue(this.queryWithNullParentKeys, 'no');
    this.r_storeState = this.setDefaultValue(this.storeState, 'yes');
    this.r_queryRows = this.setDefaultNumber(this.queryRows, Codes.DEFAULT_QUERY_ROWS);
    this.r_deleteMethod = this.setDefaultValue(this.deleteMethod, Codes.DELETE_METHOD);
    this.r_insertMethod = this.setDefaultValue(this.insertMethod, Codes.INSERT_METHOD);
    this.r_updateMethod = this.setDefaultValue(this.updateMethod, Codes.UPDATE_METHOD);
    this.r_showButtonsText = this.setDefaultValue(this.showButtonsText, 'yes');
    this.r_quickFilterPlaceholder = this.setDefaultValue(this.quickFilterPlaceholder, '');
    this.r_insertButton = this.setDefaultValue(this.insertButton, 'yes');
    this.r_refreshButton = this.setDefaultValue(this.refreshButton, 'yes');
    this.r_fixedHeader = this.setDefaultValue(this.fixedHeader, 'yes');
    this.r_controls = this.setDefaultValue(this.controls, 'yes');
    this.r_detailFormRoute = this.setDefaultValue(this.detailFormRoute, '');
    this.r_filterCaseSensitive = this.setDefaultValue(this.filterCaseSensitive, 'no');
    this.r_paginationControls = this.setDefaultValue(this.paginationControls, 'yes');
    this.r_quickFilter = this.setDefaultValue(this.quickFilter, 'yes');
    this.r_recursiveDetail = this.setDefaultValue(this.recursiveDetail, 'no');
    this.r_recursiveEdit = this.setDefaultValue(this.recursiveEdit, 'no');
    this.r_recursiveInsert = this.setDefaultValue(this.recursiveInsert, 'no');
    this.r_insertFormRoute = this.setDefaultValue(this.insertFormRoute, Codes.DEFAULT_INSERT_ROUTE);
    this.r_title = this.setDefaultValue(this.title, '');
    this.r_quickFilterAppearance = this.setDefaultValue(this.quickFilterAppearance, 'outline');
    this.r_deleteButton = this.setDefaultValue(this.deleteButton, 'yes');
  }

  private resolveTableInputs(): void {
    const cfg = this.tableConfig ?? {};
    const g = this.tableGlobalConfig;

    this.r_table_detailButtonInRow = this.setDefaultValue(cfg.detailButtonInRow, 'no');
    this.r_table_detailButtonInRowIcon = this.setDefaultValue(cfg.detailButtonInRowIcon, Codes.DETAIL_ICON);
    this.r_table_editButtonInRow = this.setDefaultValue(cfg.editButtonInRow, 'no');
    this.r_table_editButtonInRowIcon = this.setDefaultValue(cfg.editButtonInRowIcon, Codes.EDIT_ICON);
    this.r_table_editFormRoute = this.setDefaultValue(cfg.editFormRoute, '');
    this.r_table_enabled = this.setDefaultValue(cfg.enabled, 'yes');
    this.r_table_rowHeight = this.resolveStringWithGlobal(cfg.rowHeight, g?.rowHeight, Codes.DEFAULT_ROW_HEIGHT);
    this.r_table_visible = this.setDefaultValue(cfg.visible, 'yes');
    this.r_table_autoAdjust = this.resolveYesNoWithGlobal(cfg.autoAdjust, g?.autoAdjust, 'yes');
    this.r_table_autoAlignTitles = this.resolveYesNoWithGlobal(cfg.autoAlignTitles, g?.autoAlignTitles, 'yes');
    this.r_table_collapseGroupedColumns = this.setDefaultValue(cfg.collapseGroupedColumns, 'no');
    this.r_table_columnsVisibilityButton = this.setDefaultValue(cfg.columnsVisibilityButton, 'yes');
    this.r_table_defaultVisibleColumns = this.setDefaultValue(cfg.defaultVisibleColumns, '');

    this.r_table_editionMode = this.resolveStringWithGlobal(cfg.editionMode, g?.editionMode, Codes.EDITION_MODE_NONE);
    this.r_table_exportButton = this.setDefaultValue(cfg.exportButton, 'yes');
    this.r_table_exportServiceType = this.setDefaultValue(cfg.exportServiceType, 'OntimizeExportService');
    this.r_table_filterColumnActiveByDefault = this.resolveYesNoWithGlobal(
      cfg.filterColumnActiveByDefault,
      g?.filterColumnActiveByDefault,
      'yes'
    );
    this.r_table_groupable = this.setDefaultValue(cfg.groupable, 'yes');
    this.r_table_groupedColumns = this.setDefaultValue(cfg.groupedColumns, '');
    this.r_table_horizontalScroll = this.setDefaultValue(cfg.horizontalScroll, 'no');
    this.r_table_multipleSort = this.setDefaultValue(cfg.multipleSort, 'yes');
    this.r_table_nonHidableColumns = this.setDefaultValue(cfg.nonHidableColumns, '');
    this.r_table_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, Codes.PAGE_SIZE_OPTIONS);
    this.r_table_resizable = this.setDefaultValue(cfg.resizable, 'yes');
    this.r_table_selectAllCheckbox = this.setDefaultValue(cfg.selectAllCheckbox, 'no');
    this.r_table_selectAllCheckboxVisible = this.setDefaultValue(cfg.selectAllCheckboxVisible, 'no');
    this.r_table_selectionMode = this.setDefaultValue(cfg.selectionMode, Codes.SELECTION_MODE_MULTIPLE);
    this.r_table_showConfigurationOption = this.setDefaultValue(cfg.showConfigurationOption, 'yes');
    this.r_table_showFilterOption = this.setDefaultValue(cfg.showFilterOption, 'yes');
    this.r_table_showPaginatorFirstLastButtons = this.setDefaultValue(cfg.showPaginatorFirstLastButtons, 'yes');
    this.r_table_showChartsOnDemandOption = this.setDefaultValue(cfg.showChartsOnDemandOption, 'yes');
    this.r_table_showReportOnDemandOption = this.setDefaultValue(cfg.showReportOnDemandOption, 'yes');
    this.r_table_showResetWidthOption = this.setDefaultValue(cfg.showResetWidthOption, 'yes');
    this.r_table_sortColumns = this.setDefaultValue(cfg.sortColumns, '');
    this.r_table_virtualScroll = this.setDefaultValue(cfg.virtualScroll, 'yes');
    this.r_table_visibleColumns = this.setDefaultValue(cfg.visibleColumns, '');
    this.r_table_visibleExportDialogButtons = this.setDefaultValue(cfg.visibleExportDialogButtons, '');
    this.r_table_selectionOnRowClick = this.resolveYesNoWithGlobal(cfg.selectionOnRowClick, g?.selectionOnRowClick, 'yes');
    this.r_table_detailMode = this.resolveStringWithGlobal(cfg.detailMode, g?.detailMode, Codes.DETAIL_MODE_CLICK);
    this.r_table_disableSelectionFunction = cfg.disableSelectionFunction;
    this.r_table_quickFilterFunction = cfg.quickFilterFunction;
    this.r_table_rowClass = cfg.rowClass;
    this.r_table_showExpandableIconFunction = cfg.showExpandableIconFunction;
  }

  private resolveGridInputs(): void {
    const cfg = this.gridConfig ?? {};

    this.r_grid_enabled = this.setDefaultValue(cfg.enabled, 'yes');
    this.r_grid_visible = this.setDefaultValue(cfg.visible, 'yes');
    this.r_grid_cols = cfg.cols;
    this.r_grid_gridItemHeight = this.setDefaultValueAny<string | number>(cfg?.gridItemHeight, '1:1');
    this.r_grid_gutterSize = this.setDefaultValue(cfg.gutterSize, '1px');
    this.r_grid_insertButtonFloatable = this.setDefaultValue(cfg.insertButtonFloatable, 'yes');
    this.r_grid_insertButtonPosition = this.setDefaultValue(cfg.insertButtonPosition, 'bottom');
    this.r_grid_orderable = this.setDefaultValue(cfg.orderable, 'no');
    this.r_grid_showFooter = this.setDefaultValue(cfg.showFooter, 'yes');
    this.r_grid_showPageSize = this.setDefaultValue(cfg.showPageSize, 'no');
    this.r_grid_sortColumn = this.setDefaultValue(cfg.sortColumn, '');
    this.r_grid_sortableColumns = this.setDefaultValue(cfg.sortableColumns, '');
    this.r_grid_detailMode = this.setDefaultValue(cfg.detailMode, Codes.DETAIL_MODE_CLICK);
    this.r_grid_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, [8, 16, 24, 32, 64]);
    this.r_grid_quickFilterColumns = this.setDefaultValue(cfg.quickFilterColumns, this.r_columns);
  }

  private setDefaultValue(v: string | undefined | null, def: string | undefined): string | undefined {
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
    inputVal: string | undefined | null,
    globalVal: boolean | undefined | null,
    defaultVal: string
  ): string {
    const inputResolved = this.setDefaultValue(inputVal, defaultVal);
    if (inputResolved !== undefined) return inputResolved;

    if (globalVal !== undefined && globalVal !== null) {
      return globalVal ? 'yes' : 'no';
    }

    return defaultVal;
  }

  private resolveStringWithGlobal(
    inputVal: string | undefined | null,
    globalVal: string | undefined | null,
    defaultVal: string
  ): string {
    const inputResolved = this.setDefaultValue(inputVal, defaultVal);
    if (inputResolved !== undefined) return inputResolved;

    const globalResolved = this.setDefaultValue(globalVal as any, defaultVal);
    if (globalResolved !== undefined) return globalResolved;

    return defaultVal;
  }

}
