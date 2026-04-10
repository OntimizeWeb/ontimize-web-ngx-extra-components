import { Component } from "@angular/core";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'o-skeleton',
  templateUrl: './o-skeleton.component.html',
  styleUrls: ['./o-skeleton.component.scss'],
  standalone: true,
  imports: [NgxSkeletonLoaderModule],
  host: {
    '[class.o-skeleton]': 'true'
  }
})
export class OSkeletonComponent { }