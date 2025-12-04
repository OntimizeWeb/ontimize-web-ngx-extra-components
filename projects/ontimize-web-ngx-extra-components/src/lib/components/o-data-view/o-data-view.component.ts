import { Component, Input } from "@angular/core";

@Component({
  selector: 'o-data-view',
  templateUrl: './o-data-view.component.html',
  styleUrls: ['./o-data-view.component.scss'],
  host: {
    '[class.o-data-view]': 'true'
  }
})
export class ODataViewComponent {

  @Input() service!: string;
  @Input() entity!: string;
  @Input() columns!: string;
  @Input() visibleColumns?: string;
  @Input() keys!: string;
  @Input() queryRows: number = 10;
  @Input() pageable: 'yes' | 'no' = 'no';

  protected currentView = 'table';

  changeView($event): void{
    this.currentView = $event.value;
  }

 }