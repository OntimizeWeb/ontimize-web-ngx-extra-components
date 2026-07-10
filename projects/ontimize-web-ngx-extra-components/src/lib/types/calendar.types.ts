import { CalendarEvent } from 'angular-calendar';

/**
 * Available views for the `o-calendar` component.
 */
export type OCalendarView = 'month' | 'week' | 'day';

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
