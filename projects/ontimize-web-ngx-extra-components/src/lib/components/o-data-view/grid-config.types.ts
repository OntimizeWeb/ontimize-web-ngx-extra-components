export interface GridConfig {
  controls?: string;
  detailFormRoute?: string;
  detailMode?: string;
  enabled?: string;
  quickFilter?: string;
  quickFilterPlaceholder?: string;
  recursiveDetail?: string;
  title?: string;
  visible?: string;
  cols?: number;
  fixedHeader?: 'no' | 'false' | 'yes' | 'true';
  gridItemHeight?: string | number;
  gutterSize?: string;
  insertButton?: 'no' | 'false' | 'yes' | 'true';
  insertButtonFloatable?: 'no' | 'false' | 'yes' | 'true';
  insertButtonPosition?: 'botton' | 'top';
  orderable?: 'no' | 'false' | 'yes' | 'true';
  pageSizeOptions?: any[];
  paginationControls?: 'no' | 'false' | 'yes' | 'true';
  quickFilterColumns?: string;
  refreshButton?: 'no' | 'false' | 'yes' | 'true';
  showButtonsText?: 'no' | 'false' | 'yes' | 'true';
  showFooter?: 'no' | 'false' | 'yes' | 'true';
  showPageSize?: 'no' | 'false' | 'yes' | 'true';
  sortColumn?: string;
  sortableColumns?: string;
};

