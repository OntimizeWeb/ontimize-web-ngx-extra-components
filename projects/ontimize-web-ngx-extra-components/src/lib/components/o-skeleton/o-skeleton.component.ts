import { Component } from "@angular/core";

@Component({
  selector: 'o-skeleton',
  templateUrl: './o-skeleton.component.html',
  styleUrls: ['./o-skeleton.component.scss'],
  host: {
    '[class.o-skeleton]': 'true'
  }
})
export class OSkeletonComponent { }