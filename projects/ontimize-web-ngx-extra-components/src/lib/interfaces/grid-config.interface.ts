import { CustomBoolean } from "../types";

export interface GridConfig {
  enabled?: CustomBoolean;
  visible?: CustomBoolean;
  cols?: number;
  gridItemHeight?: string | number;
  gutterSize?: string;
  insertButtonFloatable?: CustomBoolean;
  insertButtonPosition?: 'botton' | 'top';
  orderable?: CustomBoolean;
  showFooter?: CustomBoolean;
  showPageSize?: CustomBoolean;
  sortColumn?: string;
  sortableColumns?: string;
};

