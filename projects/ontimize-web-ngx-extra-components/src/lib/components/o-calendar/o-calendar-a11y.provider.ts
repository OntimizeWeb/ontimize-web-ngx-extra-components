import { Injectable } from '@angular/core';
import { CalendarA11y } from 'angular-calendar';

import * as _moment from 'moment';
const moment = (_moment as any).default ?? _moment;

/**
 * angular-calendar's default {@link CalendarA11y} builds its aria labels with
 * Angular's `formatDate`, which throws `NG0701` for any locale whose data has
 * not been registered via `registerLocaleData` (e.g. "es").
 *
 * Since o-calendar already relies on the moment date adapter/formatter, this
 * subclass formats the date portion of the aria labels with moment too, so the
 * component stays drop-in and never depends on Angular locale data. The aria
 * text structure (English) is preserved from the original implementation.
 */
@Injectable()
export class OCalendarA11y extends CalendarA11y {

  private fmt(date: Date, format: string, locale: string): string {
    return moment(date).locale(locale).format(format);
  }

  override monthCell({ day, locale }: any): string {
    const date = this.fmt(day.date, 'dddd MMMM D', locale);
    if (day.badgeTotal > 0) {
      const plural = this.i18nPlural.transform(day.badgeTotal, {
        '=0': 'No events',
        '=1': 'One event',
        other: '# events'
      });
      return `${date}, ${plural}, click to expand`;
    }
    return date;
  }

  override openDayEventsLandmark({ date, locale }: any): string {
    return `Beginning of expanded view for ${this.fmt(date, 'dddd MMMM DD', locale)}`;
  }

  override openDayEventsAlert({ date, locale }: any): string {
    return `${this.fmt(date, 'dddd MMMM DD', locale)} expanded`;
  }

  override eventDescription({ event, locale }: any): string {
    if (event.allDay === true) {
      return this.allDayEventDescription({ event, locale });
    }
    const aria = `${this.fmt(event.start, 'dddd MMMM DD', locale)}, ${event.title}, from ${this.fmt(event.start, 'hh:mm a', locale)}`;
    if (event.end) {
      return aria + ` to ${this.fmt(event.end, 'hh:mm a', locale)}`;
    }
    return aria;
  }

  override allDayEventDescription({ event, locale }: any): string {
    const aria = `${event.title}, event spans multiple days: start time ${this.fmt(event.start, 'MMMM DD hh:mm a', locale)}`;
    if (event.end) {
      return aria + `, stop time ${this.fmt(event.end, 'MMMM D hh:mm a', locale)}`;
    }
    return aria + `, no stop time`;
  }
}
