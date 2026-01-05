import { Component, Injector, OnInit } from '@angular/core';
import { CompaniesService } from '../../services/companies.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  config = {
    staticData: [
      {
        id: 1,
        name: 'TechNova Solutions',
        sector: 'Tecnología',
        country: 'España',
        employees: 250,
        annualRevenue: 32.5,
        rating: 4.6,
        foundedYear: 2012
      },
      {
        id: 2,
        name: 'GreenFields Agro',
        sector: 'Agroalimentario',
        country: 'Francia',
        employees: 120,
        annualRevenue: 18.2,
        rating: 4.1,
        foundedYear: 2005
      },
      {
        id: 3,
        name: 'BlueOcean Logistics',
        sector: 'Logística',
        country: 'Países Bajos',
        employees: 430,
        annualRevenue: 54.7,
        rating: 4.3,
        foundedYear: 1998
      },
      {
        id: 4,
        name: 'Horizon HealthCare',
        sector: 'Sanidad',
        country: 'Alemania',
        employees: 980,
        annualRevenue: 210.0,
        rating: 4.8,
        foundedYear: 1987
      },
      {
        id: 5,
        name: 'UrbanBuild Group',
        sector: 'Construcción',
        country: 'España',
        employees: 350,
        annualRevenue: 76.4,
        rating: 4.0,
        foundedYear: 2001
      },
      {
        id: 6,
        name: 'SkyLine Airlines',
        sector: 'Transporte',
        country: 'Estados Unidos',
        employees: 2200,
        annualRevenue: 520.3,
        rating: 4.2,
        foundedYear: 1993
      },
      {
        id: 7,
        name: 'BrightEdu Services',
        sector: 'Educación',
        country: 'Reino Unido',
        employees: 190,
        annualRevenue: 24.1,
        rating: 4.5,
        foundedYear: 2010
      },
      {
        id: 8,
        name: 'SolarEdge Energy',
        sector: 'Energía',
        country: 'Suecia',
        employees: 410,
        annualRevenue: 95.8,
        rating: 4.7,
        foundedYear: 2008
      },
      {
        id: 9,
        name: 'FinTrust Capital',
        sector: 'Finanzas',
        country: 'Suiza',
        employees: 150,
        annualRevenue: 68.9,
        rating: 4.4,
        foundedYear: 1999
      },
      {
        id: 10,
        name: 'MediArt Studios',
        sector: 'Media',
        country: 'Italia',
        employees: 80,
        annualRevenue: 9.6,
        rating: 4.1,
        foundedYear: 2016
      }],
    columns: 'id;name;sector;country;employees;annualRevenue;rating;foundedYear',
    keys: 'id',
    queryRows: 10,
    pageable: 'no',
    tableCfg: { visibleColumns: 'name;location;price' },
    gridCfg: { cols: 3, gutterSize: '8px', gridItemHeight: '1:1', quickFilterColumns: 'name;price' },
    listCfg: {  }
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
