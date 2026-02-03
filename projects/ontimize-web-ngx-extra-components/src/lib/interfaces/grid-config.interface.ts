import { CustomBoolean } from "../types";

export interface GridConfig {
  enabled?: CustomBoolean;
  visible?: CustomBoolean;
  cols?: number;
  gridItemHeight?: string | number;
  gutterSize?: string;
  insertButtonFloatable?: CustomBoolean;
  insertButtonPosition?: 'botton' | 'top';
  pageSizeOptions?: any[];
  orderable?: CustomBoolean;
  quickFilterColumns?: string;
  showFooter?: CustomBoolean;
  showPageSize?: CustomBoolean;
  sortColumn?: string;
  sortableColumns?: string;
  detailMode?: 'none' | 'click' | 'dblclick';
};

