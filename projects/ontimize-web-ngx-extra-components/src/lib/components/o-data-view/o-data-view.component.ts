import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ContentChild,
  EmbeddedViewRef,
  Injector,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { OGridComponent, OListComponent, OTableComponent } from 'ontimize-web-ngx';

import { ODataViewConfig, ODataViewMode } from './o-data-view.types';
import { ODataViewGridItemDirective } from './o-data-view-grid-item.directive';
import { ODataViewListItemDirective } from './o-data-view-list-item.directive';

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  host: { '[class.o-data-view]': 'true' }
})
export class ODataViewComponent implements OnDestroy {

  @ViewChild('tableHost', { read: ViewContainerRef, static: false })
  private tableHost!: ViewContainerRef;

  @ViewChild('listHost', { read: ViewContainerRef, static: false })
  private listHost!: ViewContainerRef;

  @ViewChild('listContentTpl', { static: true })
  private listContentTpl!: TemplateRef<any>;

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewListItemDirective)
  listItemTpl?: ODataViewListItemDirective;

  currentView: ODataViewMode = 'table';
  gridData: any[] = [];
  listData: any[] = [];

  private tableRef?: ComponentRef<OTableComponent>;
  private listRef?: ComponentRef<OListComponent>;
  private listProjectedView?: EmbeddedViewRef<any>;
  private subs = new Subscription();

  private _config: ODataViewConfig = {};
  @Input()
  set config(v: ODataViewConfig) {
    this._config = v ?? {};
    this.currentView = this._config.defaultView ?? 'table';

    if (this._config.staticData) {
      this.gridData = this._config.staticData;
      this.listData = this._config.staticData;
    }

    this.ensureCurrentView();
  }
  get config(): ODataViewConfig {
    return this._config;
  }

  constructor(
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) { }

  changeView(e: any): void {
    const next: ODataViewMode = (e?.value ?? e) as ODataViewMode;
    if (!next || next === this.currentView) return;
    this.currentView = next;
    this.ensureCurrentView();
  }

  private ensureCurrentView(): void {
    this.cdr.detectChanges();
    if (this.currentView === 'table') this.ensureTable();
    if (this.currentView === 'list') this.ensureList();
  }

  handleGridDataLoaded(data: any[]): void {
    if (Array.isArray(data)) {
      this.gridData = data;
      this.cdr.detectChanges();
    }
  }

  private ensureTable(): void {
    if (!this.tableHost) return;
    this.tableHost.clear();
    this.tableRef = this.tableHost.createComponent(OTableComponent, { injector: this.injector });
    this.applyTableInputs(this._config);
    this.cdr.detectChanges();
  }

  private ensureList(): void {
    if (!this.listHost || !this.listItemTpl?.template) return;
    this.listHost.clear();
    const nodes = this.buildProjectedNodesForList();
    this.listRef = this.listHost.createComponent(OListComponent, {
      injector: this.injector,
      projectableNodes: [nodes]
    });
    this.applyListInputs(this._config);
    this.hookListData();
    this.cdr.detectChanges();
  }

  private buildProjectedNodesForList(): any[] {
    this.listProjectedView?.destroy();
    this.listProjectedView = this.listContentTpl.createEmbeddedView({ $implicit: this });
    this.listProjectedView.detectChanges();
    return this.listProjectedView.rootNodes ?? [];
  }

  private hookListData(): void {
    const inst: any = this.listRef?.instance;
    if (!inst) return;
    const emitter = inst.onDataLoaded;
    if (emitter?.subscribe) {
      this.subs.add(emitter.subscribe((data: any[]) => {
        this.listData = data;
        this.cdr.detectChanges();
      }));
    }
  }

  private getSupportedInputs(ref: ComponentRef<any>): Set<string> {
    const inputs = (ref.componentType as any)?.ɵcmp?.inputs ?? {};
    return new Set(Object.keys(inputs));
  }

  private setIfDefined(ref: ComponentRef<any>, inputKebab: string, value: any): void {
    if (value !== undefined && this.getSupportedInputs(ref).has(inputKebab)) {
      ref.setInput(inputKebab, value);
    }
  }
  private applyCommonInputs(ref: ComponentRef<any>, cfg: ODataViewConfig): void {
    this.setIfDefined(ref, 'attr', cfg.attr);
    this.setIfDefined(ref, 'columns', cfg.columns);
    this.setIfDefined(ref, 'configure-service-args', cfg.configureServiceArgs);
    this.setIfDefined(ref, 'entity', cfg.entity);
    this.setIfDefined(ref, 'keys', cfg.keys);
    this.setIfDefined(ref, 'pageable', cfg.pageable);
    this.setIfDefined(ref, 'paginated-query-method', cfg.paginatedQueryMethod);
    this.setIfDefined(ref, 'parent-keys', cfg.parentKeys);
    this.setIfDefined(ref, 'query-fallback-function', cfg.queryFallbackFunction);
    this.setIfDefined(ref, 'query-method', cfg.queryMethod);
    this.setIfDefined(ref, 'query-on-bind', cfg.queryOnBind);
    this.setIfDefined(ref, 'query-on-init', cfg.queryOnInit);
    this.setIfDefined(ref, 'query-rows', cfg.queryRows);
    this.setIfDefined(ref, 'query-with-null-parent-keys', cfg.queryWithNullParentKeys);
    this.setIfDefined(ref, 'service', cfg.service);
    this.setIfDefined(ref, 'service-type', cfg.serviceType);
    this.setIfDefined(ref, 'static-data', cfg.staticData);
    this.setIfDefined(ref, 'store-state', cfg.storeState);
    this.setIfDefined(ref, 'controls', cfg.controls);
    this.setIfDefined(ref, 'detail-form-route', cfg.detailFormRoute);
    this.setIfDefined(ref, 'detail-mode', cfg.detailMode);
    this.setIfDefined(ref, 'enabled', cfg.enabled);
    this.setIfDefined(ref, 'page-size-options', cfg.pageSizeOptions);
    this.setIfDefined(ref, 'pagination-controls', cfg.paginationControls);
    this.setIfDefined(ref, 'quick-filter', cfg.quickFilter);
    this.setIfDefined(ref, 'quick-filter-placeholder', cfg.quickFilterPlaceholder);
    this.setIfDefined(ref, 'recursive-detail', cfg.recursiveDetail);
    this.setIfDefined(ref, 'title', cfg.title);
    this.setIfDefined(ref, 'visible', cfg.visible);
  }

  private applyTableInputs(cfg: ODataViewConfig): void {
    if (!this.tableRef) return;
    const ref = this.tableRef;

    this.applyCommonInputs(ref, cfg);

    const t = cfg.tableCfg;
    this.setIfDefined(ref, 'delete-method', t?.deleteMethod);
    this.setIfDefined(ref, 'insert-method', t?.insertMethod);
    this.setIfDefined(ref, 'update-method', t?.updateMethod);
    this.setIfDefined(ref, 'detail-button-in-row', t?.detailButtonInRow);
    this.setIfDefined(ref, 'detail-button-in-row-icon', t?.detailButtonInRowIcon);
    this.setIfDefined(ref, 'edit-button-in-row', t?.editButtonInRow);
    this.setIfDefined(ref, 'edit-button-in-row-icon', t?.editButtonInRowIcon);
    this.setIfDefined(ref, 'edit-form-route', t?.editFormRoute);
    this.setIfDefined(ref, 'filter-case-sensitive', t?.filterCaseSensitive);
    this.setIfDefined(ref, 'insert-button', t?.insertButton);
    this.setIfDefined(ref, 'insert-form-route', t?.insertFormRoute);
    this.setIfDefined(ref, 'recursive-edit', t?.recursiveEdit);
    this.setIfDefined(ref, 'recursive-insert', t?.recursiveInsert);
    this.setIfDefined(ref, 'row-height', t?.rowHeight);
    this.setIfDefined(ref, 'auto-adjust', t?.autoAdjust);
    this.setIfDefined(ref, 'auto-align-titles', t?.autoAlignTitles);
    this.setIfDefined(ref, 'collapse-grouped-columns', t?.collapseGroupedColumns);
    this.setIfDefined(ref, 'columns-visibility-button', t?.columnsVisibilityButton);
    this.setIfDefined(ref, 'default-visible-columns', t?.defaultVisibleColumns);
    this.setIfDefined(ref, 'delete-button', t?.deleteButton);
    this.setIfDefined(ref, 'detail-mode', t?.detailMode);
    this.setIfDefined(ref, 'disable-selection-function', t?.disableSelectionFunction);
    this.setIfDefined(ref, 'edition-mode', t?.editionMode);
    this.setIfDefined(ref, 'enabled', t?.enabled);
    this.setIfDefined(ref, 'export-button', t?.exportButton);
    this.setIfDefined(ref, 'export-service-type', t?.exportServiceType);
    this.setIfDefined(ref, 'filter-column-active-by-default', t?.filterColumnActiveByDefault);
    this.setIfDefined(ref, 'fixed-header', t?.fixedHeader);
    this.setIfDefined(ref, 'groupable', t?.groupable);
    this.setIfDefined(ref, 'grouped-columns', t?.groupedColumns);
    this.setIfDefined(ref, 'horizontal-scroll', t?.horizontalScroll);
    this.setIfDefined(ref, 'keep-selected-items', t?.keepSelectedItems);
    this.setIfDefined(ref, 'multiple-sort', t?.multipleSort);
    this.setIfDefined(ref, 'non-hidable-columns', t?.nonHidableColumns);
    this.setIfDefined(ref, 'orderable', t?.orderable);
    this.setIfDefined(ref, 'pagination-controls', t?.paginationControls);
    this.setIfDefined(ref, 'quick-filter-function', t?.quickFilterFunction);
    this.setIfDefined(ref, 'refresh-button', t?.refreshButton);
    this.setIfDefined(ref, 'resizable', t?.resizable);
    this.setIfDefined(ref, 'row-class', t?.rowClass);
    this.setIfDefined(ref, 'select-all-checkbox', t?.selectAllCheckbox);
    this.setIfDefined(ref, 'select-all-checkbox-visible', t?.selectAllCheckboxVisible);
    this.setIfDefined(ref, 'selection-mode', t?.selectionMode);
    this.setIfDefined(ref, 'show-buttons-text', t?.showButtonsText);
    this.setIfDefined(ref, 'show-configuration-option', t?.showConfigurationOption);
    this.setIfDefined(ref, 'show-expandable-icon-function', t?.showExpandableIconFunction);
    this.setIfDefined(ref, 'show-filter-option', t?.showFilterOption);
    this.setIfDefined(ref, 'show-paginator-first-last-buttons', t?.showPaginatorFirstLastButtons);
    this.setIfDefined(ref, 'show-report-on-demand-option', t?.showReportOnDemandOption);
    this.setIfDefined(ref, 'show-reset-width-option', t?.showResetWidthOption);
    this.setIfDefined(ref, 'show-title', t?.showTitle);
    this.setIfDefined(ref, 'sort-columns', t?.sortColumns);
    this.setIfDefined(ref, 'virtual-scroll', t?.virtualScroll);
    this.setIfDefined(ref, 'visible-columns', t?.visibleColumns);
    this.setIfDefined(ref, 'visible-export-dialog-buttons', t?.visibleExportDialogButtons);

    this.cdr.detectChanges();
  }



  private applyListInputs(cfg: ODataViewConfig): void {
    if (!this.listRef) return;
    const ref = this.listRef;

    this.applyCommonInputs(ref, cfg);

    const l = cfg.listCfg;
    this.setIfDefined(ref, 'delete-method', l?.deleteMethod);
    this.setIfDefined(ref, 'insert-method', l?.insertMethod);
    this.setIfDefined(ref, 'update-method', l?.updateMethod);
    this.setIfDefined(ref, 'detail-button-in-row', l?.detailButtonInRow);
    this.setIfDefined(ref, 'detail-button-in-row-icon', l?.detailButtonInRowIcon);
    this.setIfDefined(ref, 'edit-button-in-row', l?.editButtonInRow);
    this.setIfDefined(ref, 'edit-button-in-row-icon', l?.editButtonInRowIcon);
    this.setIfDefined(ref, 'edit-form-route', l?.editFormRoute);
    this.setIfDefined(ref, 'insert-button', l?.insertButton);
    this.setIfDefined(ref, 'insert-form-route', l?.insertFormRoute);
    this.setIfDefined(ref, 'quick-filter-appearance', l?.quickFilterAppearance);
    this.setIfDefined(ref, 'recursive-edit', l?.recursiveEdit);
    this.setIfDefined(ref, 'recursive-insert', l?.recursiveInsert);
    this.setIfDefined(ref, 'row-height', l?.rowHeight);
    this.setIfDefined(ref, 'delete-button', l?.deleteButton);
    this.setIfDefined(ref, 'insert-button-floatable', l?.insertButtonFloatable);
    this.setIfDefined(ref, 'insert-button-position', l?.insertButtonPosition);
    this.setIfDefined(ref, 'keys-sql-types', l?.keysSqlTypes);
    this.setIfDefined(ref, 'pagination-controls', l?.paginationControls);
    this.setIfDefined(ref, 'quick-filter-columns', l?.quickFilterColumns);
    this.setIfDefined(ref, 'refresh-button', l?.refreshButton);
    this.setIfDefined(ref, 'selectable', l?.selectable);
    this.setIfDefined(ref, 'show-buttons-text', l?.showButtonsText);
    this.setIfDefined(ref, 'sort-columns', l?.sortColumns);

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.tableRef?.destroy();
    this.listRef?.destroy();
    this.listProjectedView?.destroy();
  }
}