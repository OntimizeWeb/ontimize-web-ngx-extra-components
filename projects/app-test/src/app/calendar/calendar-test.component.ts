import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'calendar-test',
  templateUrl: './calendar-test.component.html',
  styleUrls: ['./calendar-test.component.scss']
})
export class CalendarTestComponent implements OnInit {

  /** Rows served as if they came from an Ontimize service. */
  staticData: any[] = [];

  ngOnInit(): void {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const at = (day: number, hour = 9) => new Date(y, m, day, hour, 0, 0);

    this.staticData = [
      { id: 1, title: 'Arnés', code: 'A-001', start: at(3, 9), end: at(3, 10), allDay: false },
      { id: 2, title: 'Guantes', code: 'G-200', start: at(3, 11), end: at(3, 12), allDay: false },
      { id: 3, title: 'Calzado', code: 'Z-009', start: at(6, 9), end: at(6, 10), allDay: false },
      { id: 4, title: 'Casco', code: 'C-045', start: at(8, 10), end: at(8, 11), allDay: false },
      { id: 5, title: 'Gafas', code: 'GF-007', start: at(14, 12), end: at(14, 13), allDay: false },
      // A day with 3 events to showcase the "+1 more" overflow link.
      { id: 6, title: 'Arnés', code: 'A-000', start: at(17, 9), end: at(17, 10), allDay: false },
      { id: 7, title: 'Casco', code: 'C-010', start: at(17, 11), end: at(17, 12), allDay: false },
      { id: 8, title: 'Guantes', code: 'G-050', start: at(17, 13), end: at(17, 14), allDay: false },
      { id: 9, title: 'Arnés', code: 'A-050', start: at(22, 9), end: at(22, 10), allDay: false }
    ];
  }

  onEventClick(evt: any): void {
    // eslint-disable-next-line no-console
    console.log('[o-calendar] event click', evt);
    alert('Evento: ' + evt.event.title);
  }

  onDayClick(evt: any): void {
    // eslint-disable-next-line no-console
    console.log('[o-calendar] day click', evt);
  }
}
