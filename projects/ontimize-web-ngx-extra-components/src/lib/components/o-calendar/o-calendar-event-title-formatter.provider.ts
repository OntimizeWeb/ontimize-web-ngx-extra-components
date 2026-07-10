import { Injectable } from '@angular/core';
import { CalendarEvent, CalendarEventTitleFormatter } from 'angular-calendar';

/**
 * Event title formatter that allows disabling the built-in tooltips. The
 * week/day views do not expose a `tooltipDisabled` input, but they skip the
 * tooltip when its contents are empty, so returning '' turns them off.
 * Driven by the o-calendar `show-tooltip` input.
 */
@Injectable()
export class OCalendarEventTitleFormatter extends CalendarEventTitleFormatter {

  public tooltipsEnabled: boolean = true;

  public override monthTooltip(event: CalendarEvent, title?: string): string {
    return this.tooltipsEnabled ? super.monthTooltip(event, title) : '';
  }

  public override weekTooltip(event: CalendarEvent, title?: string): string {
    return this.tooltipsEnabled ? super.weekTooltip(event, title) : '';
  }

  public override dayTooltip(event: CalendarEvent, title?: string): string {
    return this.tooltipsEnabled ? super.dayTooltip(event, title) : '';
  }

}
