import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter as MatDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import {
  AbstractOServiceComponent,
  BooleanInputConverter,
  ComponentStateServiceProvider,
  DefaultServiceComponentStateService,
  OFormComponent,
  OntimizeWebModule, O_COMPONENT_STATE_SERVICE,
  Util
} from 'ontimize-web-ngx';
import {
  CalendarA11y,
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventTitleFormatter,
  CalendarModule,
  CalendarUtils,
  CalendarView,
  DateAdapter,
  MOMENT
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import { Subject } from 'rxjs';

import { TranslateExtraComponentsService } from '../../services';
import {
  OCalendarDayClick,
  OCalendarEventClick,
  OCalendarEventMapper,
  OCalendarView
} from '../../types/calendar.types';
import { OCalendarA11y } from './o-calendar-a11y.provider';
import { OCalendarDateFormatter } from './o-calendar-date-formatter.provider';
import { OCalendarEventTitleFormatter } from './o-calendar-event-title-formatter.provider';
import { OCalendarEventTemplateDirective, OCalendarTooltipTemplateDirective } from './o-calendar-templates.directive';

import * as _moment from 'moment';
const moment = (_moment as any).default ?? _moment;

/**
 * Date adapter factory backed by moment, reusing the moment dependency already
 * present in the project instead of pulling in date-fns.
 *
 * The stock moment adapter resolves the first day of the week from the global
 * moment locale and ignores the `weekStartsOn` option, so the `week-starts-on`
 * input would have no effect. Override the week boundaries so an explicit
 * input wins and the moment locale only acts as fallback.
 */
export function momentAdapterFactory(): DateAdapter {
  const adapter = adapterFactory(moment);
  const localeStartOfWeek = adapter.startOfWeek.bind(adapter);
  const localeEndOfWeek = adapter.endOfWeek.bind(adapter);

  const weekStart = (date: Date | number, weekStartsOn: number) => {
    const base = moment(date).startOf('day');
    return base.subtract((base.day() - weekStartsOn + 7) % 7, 'days');
  };

  adapter.startOfWeek = (date: Date | number, options?: { weekStartsOn?: number }): Date => {
    if (typeof options?.weekStartsOn !== 'number') {
      return localeStartOfWeek(date, options);
    }
    return weekStart(date, options.weekStartsOn).toDate();
  };
  adapter.endOfWeek = (date: Date | number, options?: { weekStartsOn?: number }): Date => {
    if (typeof options?.weekStartsOn !== 'number') {
      return localeEndOfWeek(date, options);
    }
    return weekStart(date, options.weekStartsOn).add(6, 'days').endOf('day').toDate();
  };
  return adapter;
}

export const O_CALENDAR_VIEWS: OCalendarView[] = ['day', 'week', 'month'];

const VIEW_LABELS: { [key in OCalendarView]: string } = {
  day: 'DAY',
  week: 'WEEK',
  month: 'MONTH'
};

@Component({
  selector: 'o-calendar',
  templateUrl: './o-calendar.component.html',
  styleUrls: ['./o-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, CalendarModule, OntimizeWebModule, MatButtonModule, MatDatepickerModule, MatIconModule, MatMenuModule],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ComponentStateServiceProvider,
    { provide: O_COMPONENT_STATE_SERVICE, useClass: DefaultServiceComponentStateService },
    { provide: DateAdapter, useFactory: momentAdapterFactory },
    // Material date adapter (unrelated to angular-calendar's DateAdapter above)
    // for the mat-calendar date picker opened from the toolbar title.
    provideNativeDateAdapter(),
    // angular-calendar providers normally registered via CalendarModule.forRoot().
    // Declared here so o-calendar works standalone without extra setup in the host app.
    // The title formatter override empties the tooltip text when show-tooltip is off.
    OCalendarEventTitleFormatter,
    { provide: CalendarEventTitleFormatter, useExisting: OCalendarEventTitleFormatter },
    CalendarUtils,
    // Format dates with moment (matching the moment date adapter) so we don't
    // depend on Angular's registerLocaleData for every locale (e.g. "es").
    // OCalendarDateFormatter extends the stock moment formatter and makes the
    // week header day format configurable via the week-header-day-format input.
    { provide: MOMENT, useValue: moment },
    OCalendarDateFormatter,
    { provide: CalendarDateFormatter, useExisting: OCalendarDateFormatter },
    // CalendarA11y also formats dates with Angular's formatDate; use a
    // moment-based override so aria labels don't need Angular locale data.
    { provide: CalendarA11y, useClass: OCalendarA11y }
  ]
})
export class OCalendarComponent
  extends AbstractOServiceComponent<DefaultServiceComponentStateService>
  implements OnInit, AfterViewInit, OnDestroy {

  /* -------------------- CALENDAR INPUTS -------------------- */

  @Input('view')
  set view(value: OCalendarView) {
    this.setView(value);
  }
  get view(): OCalendarView {
    return this.calendarView as OCalendarView;
  }

  @Input('view-date') viewDate: Date = new Date();

  /** Views available in the toolbar switch, e.g. "month;week;day". */
  @Input('views')
  set views(value: string | OCalendarView[]) {
    const parsed = Array.isArray(value) ? value : Util.parseArray(value, true);
    const filtered = (parsed as OCalendarView[]).filter(v => O_CALENDAR_VIEWS.indexOf(v) !== -1);
    this.availableViews = filtered.length ? filtered : [...O_CALENDAR_VIEWS];
  }
  get views(): OCalendarView[] {
    return this.availableViews;
  }

  /** Column that holds the event start date/datetime. Required in column mapping mode. */
  @Input('start-column') startColumn: string;

  /** Column that holds the event end date/datetime. Optional. */
  @Input('end-column') endColumn: string;

  /** Column used as the event title (bold part of the event pill). */
  @Input('title-column') titleColumn: string;

  /** Column shown as the secondary/muted text of the event pill. Optional. */
  @Input('description-column') descriptionColumn: string;

  /** Column that holds a color for the event (used as primary/secondary). Optional. */
  @Input('color-column') colorColumn: string;

  /** Column that flags an all-day event. Optional. */
  @Input('all-day-column') allDayColumn: string;

  /**
   * Optional mapping function. When provided it takes precedence over the
   * `*-column` inputs and is responsible for building the whole CalendarEvent.
   */
  @Input('map-function') mapFunction: OCalendarEventMapper;

  /** BCP 47 locale. Defaults to the current application language. */
  @Input('locale')
  set locale(value: string) {
    this._locale = value;
    // Keep the toolbar date picker (Material calendar) in the same locale.
    if (Util.isDefined(value) && this.matDateAdapter) {
      this.matDateAdapter.setLocale(value);
    }
  }
  get locale(): string {
    return this._locale;
  }
  protected _locale: string;

  /**
   * First day of the week (0 = Sunday ... 6 = Saturday). When not set, the
   * week starts on the first day of the current moment locale.
   */
  @Input('week-starts-on')
  set weekStartsOn(value: number | string) {
    const parsed = Number(value);
    const next = !isNaN(parsed) && parsed >= 0 && parsed <= 6 ? parsed : undefined;
    if (next === this._weekStartsOn) {
      return;
    }
    this._weekStartsOn = next;
    // The month view does not list weekStartsOn among its ngOnChanges refresh
    // triggers (the week view does), so poke the refresh subject to re-render.
    // Deferred to a microtask so the new value reaches the view binding first.
    Promise.resolve().then(() => this.refresh$.next());
  }
  get weekStartsOn(): number | undefined {
    return this._weekStartsOn;
  }
  protected _weekStartsOn: number | undefined;

  /**
   * moment format for the value shown under the weekday name in the week/day
   * view column headers. Defaults to 'D' (day number only); e.g. 'MMM D'
   * renders "Jun 8".
   */
  @Input('week-header-day-format')
  set weekHeaderDayFormat(value: string) {
    const format = value || 'D';
    if (format === this.dateFormatter.columnSubHeaderFormat) {
      return;
    }
    this.dateFormatter.columnSubHeaderFormat = format;
    // Header labels are computed by the formatter, not by an ngOnChanges-tracked
    // input, so poke the refresh subject once the view bindings are up to date.
    Promise.resolve().then(() => this.refresh$.next());
  }
  get weekHeaderDayFormat(): string {
    return this.dateFormatter.columnSubHeaderFormat;
  }

  @Input('show-toolbar')
  @BooleanInputConverter()
  showToolbar: boolean = true;

  /** Shows a tooltip on event hover (month, week and day views). */
  @Input('show-tooltip')
  set showTooltip(value: boolean | string) {
    const parsed = typeof value === 'boolean' ? value : Util.parseBoolean(String(value), true);
    if (parsed === this._showTooltip) {
      return;
    }
    this._showTooltip = parsed;
    this.titleFormatter.tooltipsEnabled = parsed;
    // Week/day tooltips are computed by a pure pipe; re-render so it re-evaluates.
    Promise.resolve().then(() => this.refresh$.next());
  }
  get showTooltip(): boolean {
    return this._showTooltip;
  }
  protected _showTooltip: boolean = true;

  /** Custom event template; replaces the default event pill in every view. */
  @ContentChild(OCalendarEventTemplateDirective, { read: TemplateRef })
  eventTemplate: TemplateRef<any>;

  /** Custom tooltip template, rendered on event hover when show-tooltip is enabled. */
  @ContentChild(OCalendarTooltipTemplateDirective, { read: TemplateRef })
  tooltipTemplate: TemplateRef<any>;

  /** Max number of event pills rendered per month cell before the "+N more" link. */
  @Input('max-events-per-cell')
  set maxEventsPerCell(value: number | string) {
    const parsed = Number(value);
    this._maxEventsPerCell = isNaN(parsed) || parsed < 1 ? 3 : parsed;
  }
  get maxEventsPerCell(): number {
    return this._maxEventsPerCell;
  }
  protected _maxEventsPerCell: number = 3;

  /* -------------------- OUTPUTS -------------------- */

  @Output() onEventClick = new EventEmitter<OCalendarEventClick>();
  @Output() onDayClick = new EventEmitter<OCalendarDayClick>();
  @Output() onViewChange = new EventEmitter<OCalendarView>();
  @Output() onViewDateChange = new EventEmitter<Date>();

  /* -------------------- INTERNAL STATE -------------------- */

  public readonly CalendarView = CalendarView;
  public calendarView: CalendarView = CalendarView.Month;
  public events: CalendarEvent[] = [];
  public readonly refresh$ = new Subject<void>();

  protected availableViews: OCalendarView[] = [...O_CALENDAR_VIEWS];
  protected extraTranslate: TranslateExtraComponentsService;
  protected dateFormatter: OCalendarDateFormatter;
  protected titleFormatter: OCalendarEventTitleFormatter;
  protected matDateAdapter: MatDateAdapter<Date>;

  @ViewChild(MatMenuTrigger) protected datePickerTrigger: MatMenuTrigger;

  constructor(
    injector: Injector,
    elRef: ElementRef,
    @Optional() form: OFormComponent
  ) {
    super(injector, elRef, form);
    this.extraTranslate = this.injector.get(TranslateExtraComponentsService);
    this.dateFormatter = this.injector.get(OCalendarDateFormatter);
    this.titleFormatter = this.injector.get(OCalendarEventTitleFormatter);
    this.matDateAdapter = this.injector.get(MatDateAdapter);
  }

  ngOnInit(): void {
    this.initialize();
  }

  ngAfterViewInit(): void {
    super.afterViewInit();
    if (this.queryOnInit) {
      this.queryData();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
    this.refresh$.complete();
  }

  initialize(): void {
    super.initialize();
    if (!Util.isDefined(this.locale)) {
      this.locale = this.translateService.getCurrentLang() || 'en';
    }
  }

  /**
   * Data delivery hook of the Ontimize service components. `queryData()` ends
   * up calling `setDataArray()` with the resolved rows (both in pageable and
   * non pageable flows), so this is the single place where we transform the
   * service rows into CalendarEvents.
   */
  setDataArray(data: any): void {
    super.setDataArray(data);
    this.buildEvents(this.getDataArray());
  }

  protected buildEvents(rows: any[]): void {
    const source = Util.isArray(rows) ? rows : [];
    this.events = source
      .map(row => this.mapRowToEvent(row))
      .filter((e): e is CalendarEvent => Util.isDefined(e));
    this.refresh$.next();
  }

  protected mapRowToEvent(row: any): CalendarEvent | undefined {
    if (typeof this.mapFunction === 'function') {
      return this.mapFunction(row);
    }
    const start = this.parseDate(row?.[this.startColumn]);
    if (!Util.isDefined(start)) {
      return undefined;
    }
    const end = Util.isDefined(this.endColumn) ? this.parseDate(row?.[this.endColumn]) : undefined;
    const color = Util.isDefined(this.colorColumn) ? row?.[this.colorColumn] : undefined;

    const event: CalendarEvent = {
      start,
      title: Util.isDefined(this.titleColumn) ? String(row?.[this.titleColumn] ?? '') : '',
      meta: row
    };
    if (Util.isDefined(end)) {
      event.end = end;
    }
    if (Util.isDefined(color) && color !== '') {
      event.color = { primary: color, secondary: color };
    }
    if (Util.isDefined(this.allDayColumn)) {
      event.allDay = !!row?.[this.allDayColumn];
    }
    return event;
  }

  protected parseDate(value: any): Date | undefined {
    if (!Util.isDefined(value) || value === '') {
      return undefined;
    }
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  /* -------------------- VIEW HANDLING -------------------- */

  setView(view: OCalendarView): void {
    const target = this.toCalendarView(view);
    if (target === this.calendarView) {
      return;
    }
    this.calendarView = target;
    this.onViewChange.emit(this.fromCalendarView(target));
  }

  /** i18n key for the toolbar view switch label (month -> 'MONTH', ...). */
  getViewLabel(view: OCalendarView): string {
    return VIEW_LABELS[view];
  }

  /** Long, localized title shown in the toolbar, e.g. "Viernes, 8 mayo 2026". */
  get toolbarTitle(): string {
    const formatted = moment(this.viewDate).locale(this.locale).format('dddd, D MMMM YYYY');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /* -------------------- MONTH CELL HELPERS -------------------- */

  /** Events shown inside a month cell, capped by maxEventsPerCell. */
  visibleEvents(day: { events?: CalendarEvent[] }): CalendarEvent[] {
    const events = day?.events ?? [];
    return events.slice(0, this.maxEventsPerCell);
  }

  /** Number of events hidden behind the "+N more" link in a month cell. */
  hiddenEventsCount(day: { events?: CalendarEvent[] }): number {
    const total = day?.events?.length ?? 0;
    return Math.max(0, total - this.maxEventsPerCell);
  }

  /** Secondary/muted text of an event pill, taken from descriptionColumn. */
  getEventDescription(event: CalendarEvent): string {
    if (!Util.isDefined(this.descriptionColumn)) {
      return '';
    }
    const value = event?.meta?.[this.descriptionColumn];
    return Util.isDefined(value) ? String(value) : '';
  }

  /** Accent color of an event pill; falls back to the theme primary. */
  getEventColor(event: CalendarEvent): string {
    return event?.color?.primary ?? 'var(--mat-sys-primary)';
  }

  /** Tooltip text for an event; an empty string disables the tooltip. */
  getEventTooltip(event: CalendarEvent): string {
    if (!this.showTooltip) {
      return '';
    }
    const title = String(event?.title ?? '');
    const description = this.getEventDescription(event);
    return description ? `${title} · ${description}` : title;
  }

  onViewDateChanged(date: Date): void {
    this.viewDate = date;
    this.onViewDateChange.emit(date);
  }

  /** Toolbar date picker: jump the calendar to the picked date. */
  onPickerDateSelected(date: Date | null): void {
    if (date) {
      this.onViewDateChanged(date);
    }
    if (this.datePickerTrigger) {
      this.datePickerTrigger.closeMenu();
    }
  }

  handleEventClicked(event: CalendarEvent): void {
    this.onEventClick.emit({ event, row: event.meta });
  }

  /** Month view: a whole day cell was clicked. */
  handleDayClicked(day: { date: Date; events?: CalendarEvent[] }): void {
    this.onDayClick.emit({ date: day.date, events: day.events ?? [] });
  }

  /** Week / day views: an hour segment was clicked. */
  handleHourSegmentClicked(date: Date): void {
    const events = this.events.filter(e => this.sameDay(e.start, date));
    this.onDayClick.emit({ date, events });
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  private toCalendarView(view: OCalendarView): CalendarView {
    switch (view) {
      case 'week':
        return CalendarView.Week;
      case 'day':
        return CalendarView.Day;
      default:
        return CalendarView.Month;
    }
  }

  private fromCalendarView(view: CalendarView): OCalendarView {
    switch (view) {
      case CalendarView.Week:
        return 'week';
      case CalendarView.Day:
        return 'day';
      default:
        return 'month';
    }
  }
}
