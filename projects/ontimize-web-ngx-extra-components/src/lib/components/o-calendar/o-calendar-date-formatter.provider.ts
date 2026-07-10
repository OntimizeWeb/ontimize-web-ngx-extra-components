import { Injectable } from '@angular/core';
import { CalendarMomentDateFormatter, DateFormatterParams } from 'angular-calendar';

import * as _moment from 'moment';
const moment = (_moment as any).default ?? _moment;

/**
 * Moment-based date formatter for o-calendar. Extends the stock moment
 * formatter to make the week/day view column sub-header (the value shown
 * under the weekday name) configurable. o-calendar exposes it through the
 * `week-header-day-format` input; the default 'D' renders the day number
 * only instead of the stock "MMM D" (month abbreviation + day).
 */
@Injectable()
export class OCalendarDateFormatter extends CalendarMomentDateFormatter {

  /** moment format applied to the week/day view column sub-header. */
  public columnSubHeaderFormat: string = 'D';

  public override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return moment(date).locale(locale).format(this.columnSubHeaderFormat);
  }

}
