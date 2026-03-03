import { AfterViewInit, Component, ContentChild, EmbeddedViewRef, Inject, Input, OnChanges, OnDestroy, OnInit, Optional, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { BooleanInputConverter, Codes, FilterExpression, LocalStorageService, O_TABLE_GLOBAL_CONFIG, OButtonToggleGroupComponent, OConfigureServiceArgs, OGridComponent, OTableComponent, OTableGlobalConfig, Util } from 'ontimize-web-ngx';
import { TableConfig } from '../../interfaces/table-config.interface';
import { GridConfig } from '../../interfaces/grid-config.interface';
import { ODataViewTableColumnsDirective, ODataViewGridItemDirective } from '../../directives';
import { ODataViewMode } from '../../types/data-view.types';

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ODataViewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('table', { static: false }) table: OTableComponent;
  @ViewChild('grid') grid: OGridComponent;
  @ViewChild('toggleGroup') toggleGroup: OButtonToggleGroupComponent;

  @ContentChild(ODataViewGridItemDirective, { static: true })
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewTableColumnsDirective, { static: true })
  tableTpl?: ODataViewTableColumnsDirective;

  @Input('default-view') defaultView?: ODataViewMode;

  @Input('toggle-button')
  @BooleanInputConverter()
  public toggleButton = true;

  @Input('toggle-on-toolbar')
  @BooleanInputConverter()
  public toggleOnToolbar = false;

  @Input('toggle-floatable')
  @BooleanInputConverter()
  public toggleFloatable = false;

  @Input() attr?: string;

  @Input() columns?: string;

  @Input('configure-service-args') configureServiceArgs?: OConfigureServiceArgs;

  @Input('delete-method') deleteMethod?: string = Codes.DELETE_METHOD;

  @Input() entity?: string;

  @Input('insert-method') insertMethod?: string = Codes.INSERT_METHOD;

  @Input() keys?: string;

  @Input()
  @BooleanInputConverter() pageable = false;

  @Input('paginated-query-method') paginatedQueryMethod?: string = Codes.PAGINATED_QUERY_METHOD;

  @Input('parent-keys') parentKeys?: string;

  @Input('query-fallback-function') queryFallbackFunction?: Function;

  @Input('query-method') queryMethod?: string = Codes.QUERY_METHOD;

  @Input('query-on-bind')
  @BooleanInputConverter() queryOnBind = true;

  @Input('query-on-init')
  @BooleanInputConverter() queryOnInit = true;

  @Input('query-rows') queryRows?: number = Codes.DEFAULT_QUERY_ROWS;

  @Input('query-with-null-parent-keys')
  @BooleanInputConverter() queryWithNullParentKeys = false;

  @Input() service?: string;

  @Input('service-type') serviceType?: string;

  @Input('static-data') staticData?: any[];

  @Input('store-state')
  @BooleanInputConverter() storeState = true;

  @Input('update-method') updateMethod?: string = Codes.UPDATE_METHOD;

  @Input('show-buttons-text')
  @BooleanInputConverter() showButtonsText = true;

  @Input('quick-filter-placeholder') quickFilterPlaceholder?: string = "";

  @Input('insert-button')
  @BooleanInputConverter() insertButton = true;

  @Input('refresh-button')
  @BooleanInputConverter() refreshButton = true;

  @Input('fixed-header')
  @BooleanInputConverter() fixedHeader = true;

  @Input()
  @BooleanInputConverter() controls = true;

  @Input() title?: string;

  @Input('quick-filter')
  @BooleanInputConverter() quickFilter = true;

  @Input('quick-filter-appearance') quickFilterAppearance?: string = 'outline';

  @Input('recursive-detail')
  @BooleanInputConverter() recursiveDetail = false;

  @Input('recursive-edit')
  @BooleanInputConverter() recursiveEdit = false;

  @Input('recursive-insert')
  @BooleanInputConverter() recursiveInsert = false;

  @Input('detail-form-route') detailFormRoute?: string;

  @Input('pagination-controls')
  @BooleanInputConverter() paginationControls = true;

  @Input('insert-form-route') insertFormRoute?: string = Codes.DEFAULT_INSERT_ROUTE;

  @Input('filter-case-sensitive')
  @BooleanInputConverter() filterCaseSensitive = false;

  @Input('delete-button')
  @BooleanInputConverter() deleteButton = true

  @Input('table-config') tableConfig?: TableConfig;

  @Input('grid-config') gridConfig?: GridConfig;

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

  ngAfterViewInit(): void {
    if (this.tableTpl && this.table) {
      this.syncTableColumnsWithTable();
    }
  }

  ngOnDestroy(): void {
    if (this.defaultView === 'table') this.persistViewState(this.table);
    else if (this.defaultView === 'grid') this.persistViewState(this.grid);
    if (this.columnsView) {
      this.columnsView.destroy();
      this.columnsView = null;
    }
  }

  private forceUpdateState(comp: any): void {
    if (!this.storeState || !comp?.updateStateStorage) return;

    (comp as any).alreadyStored = false;
    comp.updateStateStorage();
  }

  private flushCurrentViewState(): void {
    if (!this.storeState) return;

    const comp = this.defaultView === 'grid' ? this.grid : this.table;

    this.ensureStorageUser(comp);      // <- clave
    this.forceUpdateState(comp);
  }

  private persistViewState(comp: any): void {
    if (!this.storeState || !comp?.injector) return;

    const ls = comp.injector.get(LocalStorageService, null);
    if (!ls) return;

    ls.updateComponentStorage(comp, comp.getRouteKey?.());
  }

  private restoreViewState(comp: any): void {
    if (!this.storeState || !comp) return;
    comp.componentStateService?.initialize?.(comp);
  }

  private ensureStorageUser(comp: any): void {
    if (!comp?.injector) return;

    const ls = comp.injector.get(LocalStorageService, null);
    if (!ls) return;

    const data: any = ls.getStoredData();
    data.session = data.session || {};

    if (!data.session.user) {
      data.session.user = 'demo';
      ls.setLocalStorage(data);
    }
  }

  private syncTableColumnsWithTable(): void {
    if (!this.tableTpl || !this.table?.injector) return;

    if (this.columnsView) {
      this.columnsView.destroy();
      this.columnsView = null;
    }
    this.vcr.clear();

    this.columnsView = this.vcr.createEmbeddedView(
      this.tableTpl.templateRef,
      {},
      { injector: this.table.injector }
    );

    this.columnsView.detectChanges();

    setTimeout(() => {
      this.table.parseVisibleColumns(true);

      if (Util.isDefined((this.table as any).oTableColumnsGroupingComponent)) {
        this.table.setGroupColumns((this.table as any).oTableColumnsGroupingComponent.columnsArray);
      }

      if (this.storeState) {
        this.ensureStorageUser(this.table);
        (this.table as any).componentStateService?.initialize?.(this.table);
      }
    }, 0);
  }

  public changeView(value: ODataViewMode): void {
    const previousView = this.defaultView;
    const nextView = this.toggleGroup ? this.toggleGroup.getValue() : value;

    Promise.resolve().then(() => {
      if (previousView === 'table') this.persistViewState(this.table);
      else if (previousView === 'grid') this.persistViewState(this.grid);

      this.defaultView = nextView;

      if (this.defaultView === 'table') {
        setTimeout(() => {
          this.syncTableColumnsWithTable();
          setTimeout(() => this.restoreViewState(this.table), 0);
        }, 0);
      } else if (this.defaultView === 'grid') {
        setTimeout(() => this.restoreViewState(this.grid), 0);
      }
    });
  }

  ngOnChanges(): void {
    this.resolveTableInputs();
    this.resolveGridInputs();
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
    this.r_table_defaultVisibleColumns = this.optionalString(cfg.defaultVisibleColumns);

    this.r_table_editionMode = this.resolveStringWithGlobal(cfg.editionMode, g?.editionMode, Codes.EDITION_MODE_NONE);
    this.r_table_exportButton = this.setDefaultValue(cfg.exportButton, 'yes');
    this.r_table_exportServiceType = this.setDefaultValue(cfg.exportServiceType, 'OntimizeExportService');
    this.r_table_filterColumnActiveByDefault = this.resolveYesNoWithGlobal(
      cfg.filterColumnActiveByDefault,
      g?.filterColumnActiveByDefault,
      'yes'
    );
    this.r_table_groupable = this.setDefaultValue(cfg.groupable, 'yes');
    this.r_table_groupedColumns = this.optionalString(cfg.groupedColumns);
    this.r_table_horizontalScroll = this.setDefaultValue(cfg.horizontalScroll, 'no');
    this.r_table_multipleSort = this.setDefaultValue(cfg.multipleSort, 'yes');
    this.r_table_nonHidableColumns = this.optionalString(cfg.nonHidableColumns);
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
    this.r_table_sortColumns = this.optionalString(cfg.sortColumns);
    this.r_table_virtualScroll = this.setDefaultValue(cfg.virtualScroll, 'yes');
    this.r_table_visibleColumns = this.optionalString(cfg.visibleColumns);
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
    this.r_grid_sortColumn = this.optionalString(cfg.sortColumn);
    this.r_grid_sortableColumns = this.optionalString(cfg.sortableColumns);
    this.r_grid_detailMode = this.setDefaultValue(cfg.detailMode, Codes.DETAIL_MODE_CLICK);
    this.r_grid_pageSizeOptions = this.setDefaultArray(cfg.pageSizeOptions, [8, 16, 24, 32, 64]);
    this.r_grid_quickFilterColumns = this.setDefaultValue(cfg.quickFilterColumns, this.columns);
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

  private optionalString(v?: string | null): string | undefined {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s.length ? s : undefined;
  }

}
