import { Directive } from '@angular/core';

/**
 * Custom event template. Replaces the default event pill in every view:
 *
 * ```html
 * <o-calendar ...>
 *   <ng-template oCalendarEvent let-event let-row="row">...</ng-template>
 * </o-calendar>
 * ```
 *
 * Context: `$implicit` is the CalendarEvent and `row` the source data row.
 */
@Directive({
  selector: 'ng-template[oCalendarEvent]',
  standalone: true
})
export class OCalendarEventTemplateDirective { }

/**
 * Custom tooltip template, shown on event hover when `show-tooltip` is enabled:
 *
 * ```html
 * <o-calendar ...>
 *   <ng-template oCalendarTooltip let-event let-row="row">...</ng-template>
 * </o-calendar>
 * ```
 *
 * Context: `$implicit` is the CalendarEvent and `row` the source data row.
 */
@Directive({
  selector: 'ng-template[oCalendarTooltip]',
  standalone: true
})
export class OCalendarTooltipTemplateDirective { }
