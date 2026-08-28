import { CalendarEvent } from 'angular-calendar';

/**
 * Available views for the `o-calendar` component. `'year'` is opt-in only
 * (via the `views` input) — it is not part of the default view set.
 */
export type OCalendarView = 'month' | 'week' | 'day' | 'year';

/**
 * Function that maps a service data row into a `CalendarEvent`.
 * When provided to `o-calendar` it takes precedence over the column mapping inputs.
 */
export type OCalendarEventMapper = (row: any) => CalendarEvent;

/**
 * Payload emitted by the `onEventClick` output of `o-calendar`.
 */
export interface OCalendarEventClick {
  event: CalendarEvent;
  row: any;
}

/**
 * Payload emitted by the `onDayClick` output of `o-calendar`.
 */
export interface OCalendarDayClick {
  date: Date;
  events: CalendarEvent[];
}
