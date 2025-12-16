import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, Input, OnInit, ViewChild } from "@angular/core";
import { OGridComponent, OListComponent, OTableComponent } from "ontimize-web-ngx";
import { ODataViewConfig, ODataViewMode } from "./o-data-view.types";
import { ODataViewGridItemDirective } from "./o-data-view-grid-item.directive";
import { ODataViewListItemDirective } from "./o-data-view-list-item.directive";

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  host: {
    '[class.o-data-view]': 'true'
  }
})

export class ODataViewComponent implements OnInit, AfterContentInit {

  @Input() config!: ODataViewConfig;

  @ViewChild('table') table: OTableComponent;

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewListItemDirective)
  listItemTpl?: ODataViewListItemDirective;

  currentView: ODataViewMode = 'table';
  inputs: Record<string, any> = {};

  contentReady = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterContentInit(): void {
    this.contentReady = true;
    this.cdr.detectChanges(); // evita el NG0100
    console.log('gridItemTplDir', this.gridItemTpl);
    console.log('grid template', this.gridItemTpl?.template);
  }

  ngOnInit(): void {
    if (this.config?.defaultView) {
      this.currentView = this.config.defaultView;
    }
  }

  ngAfterViewInit(): void {
    console.log(this.table.columns);
    console.log(this.table.visibleColumns);
    console.log(this.table.dataArray);
  }

  changeView($event): void {
    this.currentView = $event.value;
  }

  showData() {
    console.log(this.table.dataArray);
  }


  private assignIfDefined(target: any, key: string, value: any): void {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  private buildTableInputs(cfg: ODataViewConfig): Record<string, any> {
    const inputs: any = {};

    const isStatic = Array.isArray(cfg.staticData) && cfg.staticData.length > 0;

    // ======== ORDEN EXACTO como en ODataViewConfig (parte común) ========
    // defaultView -> NO se pasa al o-table (solo lo usa tu o-data-view)
    this.assignIfDefined(inputs, 'attr', cfg.attr);
    this.assignIfDefined(inputs, 'columns', cfg.columns);
    this.assignIfDefined(inputs, 'configureServiceArgs', cfg.configureServiceArgs);

    // entity: solo si NO es static
    if (!isStatic) this.assignIfDefined(inputs, 'entity', cfg.entity);

    this.assignIfDefined(inputs, 'keys', cfg.keys);
    this.assignIfDefined(inputs, 'pageable', cfg.pageable);
    this.assignIfDefined(inputs, 'paginatedQueryMethod', cfg.paginatedQueryMethod);
    this.assignIfDefined(inputs, 'parentKeys', cfg.parentKeys);
    this.assignIfDefined(inputs, 'queryFallbackFunction', cfg.queryFallbackFunction);
    this.assignIfDefined(inputs, 'queryMethod', cfg.queryMethod);
    this.assignIfDefined(inputs, 'queryOnBind', cfg.queryOnBind);
    this.assignIfDefined(inputs, 'queryOnInit', cfg.queryOnInit);
    this.assignIfDefined(inputs, 'queryRows', cfg.queryRows);
    this.assignIfDefined(inputs, 'queryWithNullParentKeys', cfg.queryWithNullParentKeys);

    // service/serviceType: solo si NO es static
    if (!isStatic) {
      this.assignIfDefined(inputs, 'service', cfg.service);
      this.assignIfDefined(inputs, 'serviceType', cfg.serviceType);
    }

    // staticData: SOLO si es static
    if (isStatic) {
      this.assignIfDefined(inputs, 'staticData', cfg.staticData);
    }

    this.assignIfDefined(inputs, 'storeState', cfg.storeState);
    this.assignIfDefined(inputs, 'controls', cfg.controls);
    this.assignIfDefined(inputs, 'detailFormRoute', cfg.detailFormRoute);
    this.assignIfDefined(inputs, 'detailMode', cfg.detailMode);
    this.assignIfDefined(inputs, 'enabled', cfg.enabled);
    this.assignIfDefined(inputs, 'pageSizeOptions', cfg.pageSizeOptions);
    this.assignIfDefined(inputs, 'paginationControls', cfg.paginationControls);
    this.assignIfDefined(inputs, 'quickFilter', cfg.quickFilter);
    // quickFilterAppearance (solo OList) -> NO aquí
    this.assignIfDefined(inputs, 'quickFilterPlaceholder', cfg.quickFilterPlaceholder);
    this.assignIfDefined(inputs, 'recursiveDetail', cfg.recursiveDetail);
    // recursiveEdit/recursiveInsert/rowHeight -> los tienes en tableCfg/listCfg, no comunes
    this.assignIfDefined(inputs, 'title', cfg.title);
    this.assignIfDefined(inputs, 'visible', cfg.visible);

    // ======== ORDEN como en tableCfg ========
    const t = cfg.tableCfg;
    if (t) {
      this.assignIfDefined(inputs, 'deleteMethod', t.deleteMethod);
      this.assignIfDefined(inputs, 'insertMethod', t.insertMethod);
      this.assignIfDefined(inputs, 'updateMethod', t.updateMethod);
      this.assignIfDefined(inputs, 'detailButtonInRow', t.detailButtonInRow);
      this.assignIfDefined(inputs, 'detailButtonInRowIcon', t.detailButtonInRowIcon);
      this.assignIfDefined(inputs, 'editButtonInRow', t.editButtonInRow);
      this.assignIfDefined(inputs, 'editButtonInRowIcon', t.editButtonInRowIcon);
      this.assignIfDefined(inputs, 'editFormRoute', t.editFormRoute);
      this.assignIfDefined(inputs, 'filterCaseSensitive', t.filterCaseSensitive);
      this.assignIfDefined(inputs, 'insertButton', t.insertButton);
      this.assignIfDefined(inputs, 'insertFormRoute', t.insertFormRoute);
      this.assignIfDefined(inputs, 'recursiveEdit', t.recursiveEdit);
      this.assignIfDefined(inputs, 'recursiveInsert', t.recursiveInsert);
      this.assignIfDefined(inputs, 'rowHeight', t.rowHeight);

      this.assignIfDefined(inputs, 'autoAdjust', t.autoAdjust);
      this.assignIfDefined(inputs, 'autoAlignTitles', t.autoAlignTitles);
      this.assignIfDefined(inputs, 'collapseGroupedColumns', t.collapseGroupedColumns);
      this.assignIfDefined(inputs, 'columnsVisibilityButton', t.columnsVisibilityButton);
      this.assignIfDefined(inputs, 'defaultVisibleColumns', t.defaultVisibleColumns);
      this.assignIfDefined(inputs, 'deleteButton', t.deleteButton);
      this.assignIfDefined(inputs, 'detailMode', t.detailMode);
      this.assignIfDefined(inputs, 'disableSelectionFunction', t.disableSelectionFunction);
      this.assignIfDefined(inputs, 'editionMode', t.editionMode);
      this.assignIfDefined(inputs, 'enabled', t.enabled);
      this.assignIfDefined(inputs, 'exportButton', t.exportButton);
      this.assignIfDefined(inputs, 'exportServiceType', t.exportServiceType);
      this.assignIfDefined(inputs, 'filterColumnActiveByDefault', t.filterColumnActiveByDefault);
      this.assignIfDefined(inputs, 'fixedHeader', t.fixedHeader);
      this.assignIfDefined(inputs, 'groupable', t.groupable);
      this.assignIfDefined(inputs, 'groupedColumns', t.groupedColumns);
      this.assignIfDefined(inputs, 'horizontalScroll', t.horizontalScroll);
      this.assignIfDefined(inputs, 'keepSelectedItems', t.keepSelectedItems);
      this.assignIfDefined(inputs, 'multipleSort', t.multipleSort);
      this.assignIfDefined(inputs, 'nonHidableColumns', t.nonHidableColumns);
      this.assignIfDefined(inputs, 'orderable', t.orderable);
      this.assignIfDefined(inputs, 'paginationControls', t.paginationControls);
      this.assignIfDefined(inputs, 'quickFilterFunction', t.quickFilterFunction);
      this.assignIfDefined(inputs, 'refreshButton', t.refreshButton);
      this.assignIfDefined(inputs, 'resizable', t.resizable);
      this.assignIfDefined(inputs, 'rowClass', t.rowClass);
      this.assignIfDefined(inputs, 'selectAllCheckbox', t.selectAllCheckbox);
      this.assignIfDefined(inputs, 'selectAllCheckboxVisible', t.selectAllCheckboxVisible);
      this.assignIfDefined(inputs, 'selectionMode', t.selectionMode);
      this.assignIfDefined(inputs, 'showButtonsText', t.showButtonsText);
      this.assignIfDefined(inputs, 'showConfigurationOption', t.showConfigurationOption);
      this.assignIfDefined(inputs, 'showExpandableIconFunction', t.showExpandableIconFunction);
      this.assignIfDefined(inputs, 'showFilterOption', t.showFilterOption);
      this.assignIfDefined(inputs, 'showPaginatorFirstLastButtons', t.showPaginatorFirstLastButtons);
      this.assignIfDefined(inputs, 'showReportOnDemandOption', t.showReportOnDemandOption);
      this.assignIfDefined(inputs, 'showResetWidthOption', t.showResetWidthOption);
      this.assignIfDefined(inputs, 'showTitle', t.showTitle);
      this.assignIfDefined(inputs, 'sortColumns', t.sortColumns);
      this.assignIfDefined(inputs, 'virtualScroll', t.virtualScroll);
      this.assignIfDefined(inputs, 'visibleColumns', t.visibleColumns);
      this.assignIfDefined(inputs, 'visibleExportDialogButtons', t.visibleExportDialogButtons);
    }

    return inputs;
  }



  private get common(): Record<string, any> {
    const c = this.config || {};
    return {
      attr: c.attr,
      title: c.title,
      service: c.service,
      serviceType: c.serviceType,
      entity: c.entity,
      columns: c.columns,
      keys: c.keys,
      configureServiceArgs: c.configureServiceArgs,
      queryMethod: c.queryMethod,
      paginatedQueryMethod: c.paginatedQueryMethod,
      queryRows: c.queryRows,
      pageable: c.pageable,
      queryOnInit: c.queryOnInit,
      queryOnBind: c.queryOnBind,
      queryWithNullParentKeys: c.queryWithNullParentKeys,
      queryFallbackFunction: c.queryFallbackFunction,
      parentKeys: c.parentKeys,
      storeState: c.storeState,
      staticData: c.staticData,
      controls: c.controls,
      detailFormRoute: c.detailFormRoute,
      detailMode: c.detailMode,
      recursiveDetail: c.recursiveDetail,
      enabled: c.enabled,
      visible: c.visible,
      pageSizeOptions: c.pageSizeOptions,
      paginationControls: c.paginationControls,
      quickFilter: c.quickFilter,
      quickFilterPlaceholder: c.quickFilterPlaceholder
    };
  }

  get tableInputs(): Record<string, any> {
    const c = this.config || {};
    const t = c.tableCfg || {};

    return {
      ...this.common,
      deleteMethod: t.deleteMethod,
      insertMethod: t.insertMethod,
      updateMethod: t.updateMethod,
      detailButtonInRow: t.detailButtonInRow,
      detailButtonInRowIcon: t.detailButtonInRowIcon,
      editButtonInRow: t.editButtonInRow,
      editButtonInRowIcon: t.editButtonInRowIcon,
      editFormRoute: t.editFormRoute,
      insertButton: t.insertButton,
      insertFormRoute: t.insertFormRoute,
      filterCaseSensitive: t.filterCaseSensitive,
      recursiveEdit: t.recursiveEdit,
      recursiveInsert: t.recursiveInsert,
      rowHeight: t.rowHeight,
      autoAdjust: t.autoAdjust,
      autoAlignTitles: t.autoAlignTitles,
      collapseGroupedColumns: t.collapseGroupedColumns,
      columnsVisibilityButton: t.columnsVisibilityButton,
      defaultVisibleColumns: t.defaultVisibleColumns,
      deleteButton: t.deleteButton,
      detailMode: t.detailMode ?? c.detailMode,
      disableSelectionFunction: t.disableSelectionFunction,
      editionMode: t.editionMode,
      enabled: t.enabled ?? c.enabled,
      exportButton: t.exportButton,
      exportServiceType: t.exportServiceType,
      filterColumnActiveByDefault: t.filterColumnActiveByDefault,
      fixedHeader: t.fixedHeader,
      groupable: t.groupable,
      groupedColumns: t.groupedColumns,
      horizontalScroll: t.horizontalScroll,
      keepSelectedItems: t.keepSelectedItems,
      multipleSort: t.multipleSort,
      nonHidableColumns: t.nonHidableColumns,
      orderable: t.orderable,
      paginationControls: t.paginationControls,
      quickFilterFunction: t.quickFilterFunction,
      refreshButton: t.refreshButton,
      resizable: t.resizable,
      rowClass: t.rowClass,
      selectAllCheckbox: t.selectAllCheckbox,
      selectAllCheckboxVisible: t.selectAllCheckboxVisible,
      selectionMode: t.selectionMode,
      showButtonsText: t.showButtonsText,
      showConfigurationOption: t.showConfigurationOption,
      showExpandableIconFunction: t.showExpandableIconFunction,
      showFilterOption: t.showFilterOption,
      showPaginatorFirstLastButtons: t.showPaginatorFirstLastButtons,
      showReportOnDemandOption: t.showReportOnDemandOption,
      showResetWidthOption: t.showResetWidthOption,
      showTitle: t.showTitle,
      sortColumns: t.sortColumns,
      virtualScroll: t.virtualScroll,
      visibleColumns: t.visibleColumns,
      visibleExportDialogButtons: t.visibleExportDialogButtons
    };
  }

  get gridInputs(): Record<string, any> {
    const g = this.config?.gridCfg || {};
    return {
      ...this.common,
      cols: g.cols,
      fixedHeader: g.fixedHeader,
      gridItemHeight: g.gridItemHeight,
      gutterSize: g.gutterSize,
      insertButton: g.insertButton,
      insertButtonFloatable: g.insertButtonFloatable,
      insertButtonPosition: g.insertButtonPosition,
      orderable: g.orderable,
      pageSizeOptions: g.pageSizeOptions,
      paginationControls: g.paginationControls,
      quickFilterColumns: g.quickFilterColumns,
      refreshButton: g.refreshButton,
      showButtonsText: g.showButtonsText,
      showFooter: g.showFooter,
      showPageSize: g.showPageSize,
      sortColumn: g.sortColumn,
      sortableColumns: g.sortableColumns
    };
  }

  get listInputs(): Record<string, any> {
    const l = this.config?.listCfg || {};
    return {
      ...this.common,
      deleteMethod: l.deleteMethod,
      insertMethod: l.insertMethod,
      updateMethod: l.updateMethod,
      detailButtonInRow: l.detailButtonInRow,
      detailButtonInRowIcon: l.detailButtonInRowIcon,
      editButtonInRow: l.editButtonInRow,
      editButtonInRowIcon: l.editButtonInRowIcon,
      editFormRoute: l.editFormRoute,
      insertButton: l.insertButton,
      insertFormRoute: l.insertFormRoute,
      quickFilterAppearance: l.quickFilterAppearance,
      recursiveEdit: l.recursiveEdit,
      recursiveInsert: l.recursiveInsert,
      rowHeight: l.rowHeight,
      deleteButton: l.deleteButton,
      insertButtonFloatable: l.insertButtonFloatable,
      insertButtonPosition: l.insertButtonPosition,
      keysSqlTypes: l.keysSqlTypes,
      paginationControls: l.paginationControls,
      quickFilterColumns: l.quickFilterColumns,
      refreshButton: l.refreshButton,
      selectable: l.selectable,
      showButtonsText: l.showButtonsText,
      sortColumns: l.sortColumns
    };
  }

}