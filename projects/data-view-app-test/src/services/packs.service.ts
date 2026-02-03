
import { Injectable, Injector } from '@angular/core';
import { Expression, FilterExpressionUtils, Observable, OntimizeService, OntimizeServiceResponse, Util } from 'ontimize-web-ngx';
import { of } from 'rxjs';

@Injectable()
export class PacksService extends OntimizeService {
  private packsAventura = {
    code: 0,
    message: "",
    data: [{
      id: 1,
      name: "Aventura en los Pirineos",
      location: "Pirineos, España",
      price: 450,
      duration: 5,
      score: 4.7,
      people: 8,
      dateBegin: "2025-05-01",
      dateEnd: "2025-10-15"
    },
    {
      id: 2,
      name: "Rafting extremo en el Nilo Blanco",
      location: "Jinja, Uganda",
      price: 890,
      duration: 7,
      score: 4.9,
      people: 6,
      dateBegin: "2025-06-01",
      dateEnd: "2025-09-30"
    },
    {
      id: 3,
      name: "Expedición al Desierto del Sáhara",
      location: "Merzouga, Marruecos",
      price: 720,
      duration: 6,
      score: 4.6,
      people: 10,
      dateBegin: "2025-03-15",
      dateEnd: "2025-06-30"
    },
    {
      id: 4,
      name: "Buceo en la Gran Barrera de Coral",
      location: "Queensland, Australia",
      price: 1200,
      duration: 8,
      score: 5.0,
      people: 4,
      dateBegin: "2025-04-01",
      dateEnd: "2025-11-30"
    },
    {
      id: 5,
      name: "Ruta en kayak por los fiordos noruegos",
      location: "Bergen, Noruega",
      price: 980,
      duration: 7,
      score: 4.8,
      people: 6,
      dateBegin: "2025-05-15",
      dateEnd: "2025-09-15"
    },
    {
      id: 6,
      name: "Trekking en el Camino del Inca",
      location: "Cusco, Perú",
      price: 650,
      duration: 4,
      score: 4.9,
      people: 12,
      dateBegin: "2025-04-01",
      dateEnd: "2025-10-31"
    },
    {
      id: 7,
      name: "Escalada en roca en El Chaltén",
      location: "Patagonia, Argentina",
      price: 770,
      duration: 6,
      score: 4.5,
      people: 5,
      dateBegin: "2025-11-01",
      dateEnd: "2026-03-31"
    },
    {
      id: 8,
      name: "Safari fotográfico en Kenia",
      location: "Masai Mara, Kenia",
      price: 1550,
      duration: 10,
      score: 4.8,
      people: 8,
      dateBegin: "2025-07-01",
      dateEnd: "2025-10-30"
    },
    {
      id: 9,
      name: "Caminata por la Selva Amazónica",
      location: "Manaos, Brasil",
      price: 820,
      duration: 5,
      score: 4.4,
      people: 6,
      dateBegin: "2025-01-10",
      dateEnd: "2025-06-15"
    },
    {
      id: 10,
      name: "Parapente sobre los Alpes suizos",
      location: "Interlaken, Suiza",
      price: 590,
      duration: 3,
      score: 4.9,
      people: 2,
      dateBegin: "2025-04-15",
      dateEnd: "2025-09-30"
    },
    {
      id: 11,
      name: "Aventura de canyoning en Sierra de Guara",
      location: "Huesca, España",
      price: 510,
      duration: 4,
      score: 4.7,
      people: 9,
      dateBegin: "2025-04-15",
      dateEnd: "2025-10-20"
    },
    {
      id: 12,
      name: "Ruta en bici por la Toscana",
      location: "Florencia, Italia",
      price: 740,
      duration: 6,
      score: 4.6,
      people: 10,
      dateBegin: "2025-03-20",
      dateEnd: "2025-11-05"
    },
    {
      id: 13,
      name: "Auroras boreales en Laponia",
      location: "Rovaniemi, Finlandia",
      price: 1350,
      duration: 5,
      score: 4.9,
      people: 8,
      dateBegin: "2025-11-15",
      dateEnd: "2026-03-20"
    },
    {
      id: 14,
      name: "Escapada de surf en Nazaré",
      location: "Nazaré, Portugal",
      price: 620,
      duration: 5,
      score: 4.5,
      people: 7,
      dateBegin: "2025-09-01",
      dateEnd: "2026-02-28"
    },
    {
      id: 15,
      name: "Travesía en velero por las Islas Griegas",
      location: "Cícladas, Grecia",
      price: 1100,
      duration: 7,
      score: 4.8,
      people: 6,
      dateBegin: "2025-05-10",
      dateEnd: "2025-10-10"
    },
    {
      id: 16,
      name: "Senderismo volcánico en Islandia",
      location: "Reykjavík, Islandia",
      price: 980,
      duration: 6,
      score: 4.9,
      people: 12,
      dateBegin: "2025-06-01",
      dateEnd: "2025-09-25"
    },
    {
      id: 17,
      name: "Snorkel y cuevas marinas en Yucatán",
      location: "Tulum, México",
      price: 790,
      duration: 5,
      score: 4.7,
      people: 8,
      dateBegin: "2025-02-01",
      dateEnd: "2025-08-31"
    },
    {
      id: 18,
      name: "Escalada en hielo en los Tatras",
      location: "Zakopane, Polonia",
      price: 860,
      duration: 6,
      score: 4.6,
      people: 6,
      dateBegin: "2025-12-01",
      dateEnd: "2026-03-15"
    },
    {
      id: 19,
      name: "Campamento de glaciares en Alaska",
      location: "Anchorage, EE. UU.",
      price: 1750,
      duration: 9,
      score: 4.8,
      people: 5,
      dateBegin: "2025-06-15",
      dateEnd: "2025-09-10"
    },
    {
      id: 20,
      name: "Ruta de cascadas en Costa Rica",
      location: "La Fortuna, Costa Rica",
      price: 830,
      duration: 6,
      score: 4.7,
      people: 10,
      dateBegin: "2025-01-20",
      dateEnd: "2025-07-15"
    }],
    sqlTypes: {
      "id": 4,
      "name": 12,
      "location": 12,
      "price": 4,
      "duration": 4,
      "score": 6,
      "people": 4,
      "dateBegin": 93,
      "dateEnd": 93
    },
    startRecordIndex: 0,
    totalQueryRecordsNumber: 20
  };

  constructor(protected injector: Injector) {
    super(injector);
  }

  public getLocation(): Observable<any> {
    const seen = new Set<string>();
    const uniqueLocations = this.packsAventura.data
      .map(p => p.location)
      .filter(loc => {
        if (!loc) return false;
        const key = String(loc).trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const rows = uniqueLocations.map(location => ({ location }));

    return of(new OntimizeServiceResponse(
      0,
      rows,
      '',
      { location: 12 },
      0,
      rows.length
    ));
  }

  public query(
    kv: any = {}, av: string[] = [], entity?: string,
    sqltypes: any = {}, offset?: number, pagesize?: number,
    orderby?: Array<{ column: string; asc: boolean }>
  ): Observable<any> {

    let rows = [...this.packsAventura.data];

    const flat = this.convert(kv);
    if (flat?.terms?.length) {
      const pred = this.buildPredicate(flat);
      rows = rows.filter(pred);
    }

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
    const size = pagesize ?? total;
    const page = rows.slice(start, start + size);

    const data = (av?.length) ? page.map(r => Object.fromEntries(av.map(c => [c, (r as any)[c]]))) : page;

    return of(new OntimizeServiceResponse(
      this.packsAventura.code,
      data,
      this.packsAventura.message,
      this.packsAventura.sqlTypes,
      start,
      total
    ));
  }

  deCompose(expresion, columns: Array<string>, kv: Object) {
    const basicExpresion: Expression = expresion[FilterExpressionUtils.BASIC_EXPRESSION_KEY];
    const filterExpresion: Expression = expresion[FilterExpressionUtils.FILTER_EXPRESSION_KEY];

    let decomposedExpresion = kv;
    if (Util.isDefined(basicExpresion)) {
      decomposedExpresion = this.deComposeExpresion(basicExpresion, columns, kv);
    }

    /* Required for column filtering which is currently disabled */
    if (Util.isDefined(filterExpresion)) {
      decomposedExpresion = this.deComposeExpresion(filterExpresion, columns, decomposedExpresion);
    }
    return decomposedExpresion;
  }

  deComposeExpresion(expresion: any, columns: Array<string>, kv: Object) {
    if (FilterExpressionUtils.instanceofExpression(expresion)) {
      if (typeof expresion.lop !== 'string') {
        kv = this.deComposeExpresion(expresion.lop, columns, kv);
        return this.deComposeExpresion(expresion.rop, columns, kv);
      } else {
        return kv;
      }
    }
  }

  convert(input: any): any {
    const result: any = { logic: 'AND', terms: [] };
    if (input && input['@basic_expression']) {
      this.parseExpression(input['@basic_expression'], result);
    }
    if (input && input['@filter_expression']) {
      this.parseExpression(input['@filter_expression'], result);
    }
    return result;
  }

  private parseExpression(expr: any, out: any, parentLogic: any = 'AND'): void {
    if (!out.terms) out.terms = [];
    if (!out.logic) out.logic = 'AND';

    const op = String((expr.operator ?? expr.op) ?? '').toUpperCase();

    if (op === 'AND' || op === 'OR') {
      const logic = op;
      const left = expr.expr1 ?? expr.left ?? expr.lhs;
      const right = expr.expr2 ?? expr.right ?? expr.rhs;
      if (left) this.parseExpression(left, out, logic);
      if (right) this.parseExpression(right, out, logic);
      if (logic === 'OR') out.logic = 'OR';
      return;
    }

    const col =
      expr.left?.columnName ?? expr.left ?? expr.columnName ?? expr.attr ?? expr.field ?? expr.lop;
    const value = expr.right?.value ?? expr.value ?? expr.rop ?? null;
    if (!col) return;

    out.terms.push({ column: col, op: op, value: value });
  }

  private buildPredicate(flat: any): (row: any) => boolean {
    const norm = (v: any) => (v == null ? '' : String(v)).toLowerCase();
    const toNum = (v: any) => (v == null || v === '' ? NaN : Number(v));
    const toDate = (v: any) => (v ? Date.parse(v) : NaN);

    const test = (row: any, t: any): boolean => {
      const cell = row[t.column];

      switch (t.op) {
        case 'LIKE': {
          const needle = String(t.value).replace(/%/g, '').toLowerCase();
          return norm(cell).includes(needle);
        }
        case 'EQUALS':
        case '=': return String(cell) == String(t.value);

        case 'MORE':
        case '>': return toNum(cell) > toNum(t.value);
        case 'MORE_EQUAL':
        case '>=': return toNum(cell) >= toNum(t.value);
        case 'LESS':
        case '<': return toNum(cell) < toNum(t.value);
        case 'LESS_EQUAL':
        case '<=': return toNum(cell) <= toNum(t.value);

        case 'IN': {
          const arr = Array.isArray(t.value) ? t.value : [t.value];
          return arr.map(String).includes(String(cell));
        }

        case 'ISNULL': return cell == null || cell === '';
        case 'ISNOTNULL': return !(cell == null || cell === '');

        // Por si te llega operador de fecha “verbal”
        case 'DATE_MORE_EQUAL': return toDate(cell) >= toDate(t.value);
        case 'DATE_LESS_EQUAL': return toDate(cell) <= toDate(t.value);

        default: return true;
      }
    };

    return (row: any) => {
      const terms = flat?.terms || [];
      if (!terms.length) return true;
      return (flat.logic === 'OR')
        ? terms.some(term => test(row, term))
        : terms.every(term => test(row, term));
    };
  }

}
