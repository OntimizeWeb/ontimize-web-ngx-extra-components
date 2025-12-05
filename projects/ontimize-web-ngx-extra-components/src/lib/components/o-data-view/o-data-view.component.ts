import { Component, Input, ViewChild } from "@angular/core";
import { OListComponent } from "ontimize-web-ngx";

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  host: {
    '[class.o-data-view]': 'true'
  }
})
export class ODataViewComponent {

  @ViewChild('list') list: OListComponent;

  @Input() service?: string;
  @Input() serviceType?: string;
  @Input() entity?: string;
  @Input() columns?: string;
  @Input() visibleColumns?: string;
  @Input() keys?: string;
  @Input() queryRows: number = 10;
  @Input() pageable: 'yes' | 'no' = 'no';

  @Input() listItemType = 'text';
  @Input() listTitleAttr = '';
  @Input() listPrimaryAttr = '';
  @Input() listSecondaryAttr = '';
  @Input() listAvatarAttr = '';

  @Input() gridCols?: number;
  @Input() gridItemHeight?: string;
  @Input() gridGutterSize?: string;
  @Input() gridTitleAttr = '';
  @Input() gridSubtitleAttr = '';
  @Input() gridImageAttr = '';
  @Input() gridFooterAttr = '';

  protected currentView = 'table';

  changeView($event): void {
    this.currentView = $event.value;

  }

  showData() {
    console.log("datos list" + this.list.dataArray);
  }

}