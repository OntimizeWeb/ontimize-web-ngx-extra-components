import { Component, ContentChild, Input, OnInit, ViewChild } from "@angular/core";
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

export class ODataViewComponent implements OnInit {

  @Input() config!: ODataViewConfig;

  @ContentChild(ODataViewGridItemDirective)
  gridItemTpl?: ODataViewGridItemDirective;

  @ContentChild(ODataViewListItemDirective)
  listItemTpl?: ODataViewListItemDirective;

  currentView: ODataViewMode = 'table';

  ngOnInit(): void {
    if (this.config?.defaultView) {
      this.currentView = this.config.defaultView;
    }
  }

  changeView($event): void {
    this.currentView = $event.value;
  }

}