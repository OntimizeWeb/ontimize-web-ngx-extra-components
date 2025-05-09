import { MatDialog } from "@angular/material/dialog";
import { Constants } from "./constants";

export class Utils {
  static setDefaultDialogSize(dialogRef: any): void {
    dialogRef.updateSize(Constants.DEFAULT_WIDTH_DIALOG, Constants.DEFAULT_HEIGHT_DIALOG);
  }
  static setFullscreenDialogSize(dialogRef: any): void {
    dialogRef.updateSize("100%", "100%");
  }
  static cloneObject(data: Object) {
    return JSON.parse(JSON.stringify(data));
  }

  static openModalVisor(dialog: MatDialog, component: any, data: object) {
    dialog.open(component, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: Constants.DEFAULT_HEIGHT_DIALOG,
      width: Constants.DEFAULT_WIDTH_DIALOG,
      panelClass: ['o-dialog-class', 'o-table-dialog', 'o-extra-components-dialog'],
      data: data
    });
  }
}
