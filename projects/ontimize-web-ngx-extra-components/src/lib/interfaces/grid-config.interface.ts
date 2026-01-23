import { CustomBoolean } from "../types";

export interface GridConfig {
  controls?: CustomBoolean;
  detailFormRoute?: CustomBoolean;
  detailMode?: 'none' | 'click' | 'dbclick';
  enabled?: CustomBoolean;
  quickFilter?: CustomBoolean;
  quickFilterAppearance?: 'legacy' | 'standard' | 'fill' | 'outline';
  recursiveDetail?: CustomBoolean;
  title?: string;
  visible?: CustomBoolean;
  cols?: number;
  fixedHeader?: CustomBoolean;
  gridItemHeight?: string | number;
  gutterSize?: string;
  insertButtonFloatable?: CustomBoolean;
  insertButtonPosition?: 'botton' | 'top';
  orderable?: CustomBoolean;
  pageSizeOptions?: any[];
  paginationControls?: CustomBoolean;
  quickFilterColumns?: string;
  showFooter?: CustomBoolean;
  showPageSize?: CustomBoolean;
  sortColumn?: string;
  sortableColumns?: string;
};

