import { Injectable, Injector } from '@angular/core';
import {
  Expression,
  FilterExpressionUtils,
  Observable,
  OntimizeEEService,
  OntimizeServiceResponse,
  Util
} from 'ontimize-web-ngx';
import { of } from 'rxjs';

@Injectable()
export class CompaniesService extends OntimizeEEService {

  private companies = {
    code: 0,
    message: '',
    data: [
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
      }
    ],
    sqlTypes: {
      id: 4,
      name: 12,
      sector: 12,
      country: 12,
      employees: 4,
      annualRevenue: 8,
      rating: 6,
      foundedYear: 4
    },
    startRecordIndex: 0,
    totalQueryRecordsNumber: 10
  };

  constructor(protected injector: Injector) {
    super(injector);
  }

  public getCountries(): Observable<any> {
    const seen = new Set<string>();
    const uniqueCountries = this.companies.data
      .map(c => c.country)
      .filter(country => {
        if (!country) return false;
        const key = String(country).trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const rows = uniqueCountries.map(country => ({ country }));

    return of(new OntimizeServiceResponse(
      0,
      rows,
      '',
      { country: 12 },
      0,
      rows.length
    ));
  }


  public query(
    kv: any = {}, av: string[] = [], entity?: string,
    sqltypes: any = {}, offset?: number, pagesize?: number,
    orderby?: Array<{ column: string; asc: boolean }>
  ): Observable<any> {

    let rows = [...this.companies.data];

    if (orderby?.length) {
      const { column, asc } = orderby[0];
      rows.sort((a: any, b: any) => {
        const va = a[column], vb = b[column];
        if (va == null && vb == null) return 0;
        if (va == null) return asc ? -1 : 1;
        if (vb == null) return asc ? 1 : -1;
        return (va < vb ? -1 : va > vb ? 1 : 0) * (asc ? 1 : -1);
      });
    }

    const total = rows.length;
    const start = Math.max(0, offset || 0);
    const page = rows.slice(start, start + (pagesize || 10));

    const data = (av?.length)
      ? page.map(r => Object.fromEntries(av.map(c => [c, (r as any)[c]])))
      : page;

    return of(new OntimizeServiceResponse(
      this.companies.code,
      data,
      this.companies.message,
      this.companies.sqlTypes,
      start,
      total
    ));
  }

}