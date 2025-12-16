import { Component, Injector, OnInit } from '@angular/core';
import { CompaniesService } from '../../services/companies.service';
import { ODataViewConfig } from '../../../../ontimize-web-ngx-extra-components/src/lib/components/o-data-view/o-data-view.types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  config: ODataViewConfig = {
    defaultView: 'grid',
    service: 'companies',
    entity: 'companies',
    columns: 'id;name;sector;country;employees;annualRevenue;rating;foundedYear',
    keys: 'id',
    queryRows: 10,
    pageable: 'no',
    tableCfg: { visibleColumns: 'name;sector;country;rating' },
    gridCfg: { cols: 3, gutterSize: '8px', gridItemHeight: '1:1' },
    listCfg: { dense: 'yes' }
  };

  private companiesService: CompaniesService;

  protected data: any[];

  constructor(protected injector: Injector) {
    this.companiesService = new CompaniesService(injector)
    this.data = this.companiesService.getData();
  }

  ngOnInit(): void {
    this.data = this.companiesService.getData();
  }

}
