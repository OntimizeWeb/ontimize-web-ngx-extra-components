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
 *
 * The weekday name headers (month view's "MON/TUE/..." row and the week/day
 * view's own header) are overridden too, with `Intl.DateTimeFormat` instead
 * of the stock moment-based implementation: `Intl` is backed by the
 * browser's own ICU data, so every locale is translated out of the box,
 * matching the toolbar's own date picker (`provideNativeDateAdapter()`)
 * instead of requiring an explicit `import 'moment/locale/xx'` per language.
 */
@Injectable()
export class OCalendarDateFormatter extends CalendarMomentDateFormatter {

  /** moment format applied to the week/day view column sub-header. */
  public columnSubHeaderFormat: string = 'D';

  /**
   * The two documented `week-header-day-format` values ('D', the default, and
   * 'MMM D') are mapped to `Intl.DateTimeFormat` so they translate without
   * needing a moment locale import, same as the rest of this formatter. Any
   * other (undocumented, free-form) moment token still goes through moment —
   * `Intl` has no equivalent to an arbitrary format string, only a fixed set
   * of options — so a custom format's locale-dependent parts (month/weekday
   * names) still need `import 'moment/locale/xx'` in the consuming app.
   */
  public override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    if (this.columnSubHeaderFormat === 'D') {
      return new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
    }
    if (this.columnSubHeaderFormat === 'MMM D') {
      return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
    }
    return moment(date).locale(locale).format(this.columnSubHeaderFormat);
  }

  public override monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  }

  public override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  }

}
