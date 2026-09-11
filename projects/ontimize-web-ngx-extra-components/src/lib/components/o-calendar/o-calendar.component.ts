import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
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
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  AbstractOServiceComponent,
  BooleanInputConverter,
  ComponentStateServiceProvider,
  DefaultServiceComponentStateService,
  Expression,
  FilterExpressionUtils,
  ODateValueType,
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
import { Subject, Subscription } from 'rxjs';

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

/**
 * Every view the `views` input accepts, including `'year'` — which is
 * deliberately left out of `O_CALENDAR_VIEWS` (the default view set) so
 * existing consumers don't get a new toolbar button without asking for it.
 */
const ALL_CALENDAR_VIEWS: Set<OCalendarView> = new Set([...O_CALENDAR_VIEWS, 'year']);

const VIEW_LABELS: { [key in OCalendarView]: string } = {
  day: 'DAY',
  week: 'WEEK',
  month: 'MONTH',
  year: 'YEAR'
};

@Component({
  selector: 'o-calendar',
  templateUrl: './o-calendar.component.html',
  styleUrls: ['./o-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, CalendarModule, OntimizeWebModule, MatButtonModule, MatDatepickerModule, MatIconModule, MatMenuModule, NgxSkeletonLoaderModule],
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
    return this.isYearView ? 'year' : (this.calendarView as OCalendarView);
  }

  @Input('view-date') viewDate: Date = new Date();

  /** Views available in the toolbar switch, e.g. "month;week;day". */
  @Input('views')
  set views(value: string | OCalendarView[]) {
    const parsed = Array.isArray(value) ? value : Util.parseArray(value, true);
    const filtered = (parsed as OCalendarView[]).filter(v => ALL_CALENDAR_VIEWS.has(v));
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

  /**
   * Wire format of `start-column`/`end-column` as actually stored in the
   * entity, used to build the server-side view-range filter (see
   * `getComponentFilter`) with values comparable to those columns: `timestamp`
   * (epoch ms, the same default used by `o-date-input`/`o-table` date
   * filters), `iso-8601`, `date` (JS `Date`) or `string` (formatted with
   * `value-format`).
   */
  @Input('value-type')
  set valueType(value: ODateValueType) {
    this._valueType = Util.convertToODateValueType(value);
  }
  get valueType(): ODateValueType {
    return this._valueType;
  }
  protected _valueType: ODateValueType = 'timestamp';

  /** Moment format used to build the range filter when `value-type="string"`. */
  @Input('value-format') valueFormat: string = 'L';

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
    const next = !Number.isNaN(parsed) && parsed >= 0 && parsed <= 6 ? parsed : undefined;
    if (next === this._weekStartsOn) {
      return;
    }
    this._weekStartsOn = next;
    // The month view does not list weekStartsOn among its ngOnChanges refresh
    // triggers (the week view does), so poke the refresh subject to re-render.
    // Deferred to a microtask so the new value reaches the view binding first.
    Promise.resolve().then(() => this.refresh$.next());
    // The visible range shifts with the week padding, so re-query too.
    this.refreshQueryForView();
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
    this.applyWeekHeaderDayFormat(value);
  }
  get weekHeaderDayFormat(): string {
    return this.dateFormatter.columnSubHeaderFormat;
  }

  /**
   * Applies the week/day header format, defaulting to 'D' (day number only).
   * A regular method (not the `weekHeaderDayFormat` setter above) so the
   * default can be an actual default parameter — TypeScript doesn't allow
   * default values on `set` accessor parameters.
   */
  private applyWeekHeaderDayFormat(value: string = 'D'): void {
    if (value === this.dateFormatter.columnSubHeaderFormat) {
      return;
    }
    this.dateFormatter.columnSubHeaderFormat = value;
    // Header labels are computed by the formatter, not by an ngOnChanges-tracked
    // input, so poke the refresh subject once the view bindings are up to date.
    Promise.resolve().then(() => this.refresh$.next());
  }

  /**
   * The week view's today circle is sized for a bare day number ('D'). Any
   * other format (e.g. 'MMM D') renders longer text that a 24px circle would
   * either clip or stretch into an oval, so it switches to a rounded-rect pill.
   */
  @HostBinding('class.o-cal-week-header-wide')
  get isWeekHeaderFormatWide(): boolean {
    return this.weekHeaderDayFormat !== 'D';
  }

  /** Matches the component's own selector, same convention every ontimize-web-ngx component follows (e.g. o-form-navigation -> class.o-form-navigation). */
  @HostBinding('class.o-calendar') readonly hostClass = true;

  @Input('show-toolbar')
  @BooleanInputConverter()
  showToolbar: boolean = true;

  /**
   * Shows the hourly time grid in the week/day views. Set to `no` when events
   * are all-day (or hours are not relevant) to render an agenda-style list of
   * event cards per day instead of an (otherwise empty) hour-by-hour grid.
   */
  @Input('show-hours')
  @BooleanInputConverter()
  showHours: boolean = true;

  /** Shows Saturday/Sunday columns in the month and week views. */
  @Input('show-weekends')
  @BooleanInputConverter()
  showWeekends: boolean = true;

  /** Text shown in place of a day's event list in the agenda (`show-hours="no"`) when it has no events. Set to `''` to show nothing. */
  @Input('empty-cell-text') emptyCellText: string = '';

  /** Day-of-week numbers excluded from the month/week grids, derived from `show-weekends`. */
  protected get excludeDays(): number[] {
    return this.showWeekends ? [] : [0, 6];
  }

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

  /**
   * Function that computes the tooltip text for an event from its source row,
   * taking precedence over the default title/description text. Mirrors
   * `o-table-column`'s own `tooltip-function` input. Has no effect when a
   * custom `oCalendarTooltip` template is provided, since that replaces the
   * tooltip's markup entirely rather than just its text.
   */
  @Input('tooltip-function') tooltipFunction: (row: any) => string;

  /** Custom event template; replaces the default event pill in every view. */
  @ContentChild(OCalendarEventTemplateDirective, { read: TemplateRef })
  eventTemplate: TemplateRef<any>;

  /** Custom tooltip template, rendered on event hover when show-tooltip is enabled. */
  @ContentChild(OCalendarTooltipTemplateDirective, { read: TemplateRef })
  tooltipTemplate: TemplateRef<any>;

  /** Max number of event pills rendered per month view day cell before the "+N more" link. */
  @Input('max-events-per-month-cell')
  set maxEventsPerMonthCell(value: number | string) {
    const parsed = Number(value);
    this._maxEventsPerMonthCell = Number.isNaN(parsed) || parsed < 1 ? 3 : parsed;
  }
  get maxEventsPerMonthCell(): number {
    return this._maxEventsPerMonthCell;
  }
  protected _maxEventsPerMonthCell: number = 3;

  /** Whether the "+N more" indicator opens the day events popover on click, or is just a static label. */
  @Input('more-clickable')
  @BooleanInputConverter()
  moreClickable: boolean = true;

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

  /**
   * Whether the year view is active. Kept separate from `calendarView`
   * because angular-calendar's own `CalendarView` enum only knows about
   * Month/Week/Day — there is no native year view to delegate to, so the
   * year grid is rendered entirely by this component. `calendarView` keeps
   * reflecting the last real angular-calendar view (month/week/day), which is
   * what setView() restores when leaving year view.
   */
  public isYearView: boolean = false;

  /** Placeholder items for the loading skeleton (month: a 7x5 grid; week: one per visible day). */
  protected readonly skeletonMonthCells = Array.from({ length: 35 });
  protected get skeletonWeekColumns(): unknown[] {
    return Array.from({ length: this.weekDays.length || 7 });
  }

  /**
   * `ngx-skeleton-loader` themes shaped like an actual agenda cell/column
   * (a day-number circle, a weekday label in week/day, and a few event-card
   * bars) instead of one flat, undifferentiated block.
   */
  protected readonly skeletonDayNumberTheme = {
    width: '18px',
    height: '18px',
    margin: '0',
    'background-color': 'var(--o-cal-hover)'
  };
  protected readonly skeletonWeekdayTheme = {
    width: '32px',
    height: '8px',
    margin: '0 0 6px',
    'border-radius': '4px',
    'background-color': 'var(--o-cal-hover)'
  };
  /** Varying widths so the stacked event bars don't all look identical. */
  protected readonly skeletonEventThemes = [
    { width: '90%', height: '14px', margin: '0', 'border-radius': '3px', 'background-color': 'var(--o-cal-hover)' },
    { width: '65%', height: '14px', margin: '0', 'border-radius': '3px', 'background-color': 'var(--o-cal-hover)' },
    { width: '80%', height: '14px', margin: '0', 'border-radius': '3px', 'background-color': 'var(--o-cal-hover)' }
  ];
  /** Event bar rows per skeleton cell/column — month cells are compact (2), week/day columns have room for more (3). */
  protected readonly skeletonMonthEventRows = Array.from({ length: 2 });
  protected readonly skeletonColumnEventRows = Array.from({ length: 3 });

  /** Year skeleton: 12 mini-months, each with a title bar and a plain (non-shimmering) day grid — a full ngx-skeleton-loader per day cell (12 * ~35) would be excessive for what is only a placeholder shape. */
  protected readonly skeletonYearMonths = Array.from({ length: 12 });
  protected readonly skeletonYearDays = Array.from({ length: 35 });
  protected readonly skeletonYearMonthTitleTheme = {
    width: '55%',
    height: '10px',
    margin: '0 0 6px',
    'border-radius': '4px',
    'background-color': 'var(--o-cal-hover)'
  };

  protected availableViews: OCalendarView[] = [...O_CALENDAR_VIEWS];
  protected extraTranslate: TranslateExtraComponentsService;
  protected dateFormatter: OCalendarDateFormatter;
  protected titleFormatter: OCalendarEventTitleFormatter;
  protected matDateAdapter: MatDateAdapter<Date>;
  protected dateAdapter: DateAdapter;

  /** Day behind the currently open "+N more" popover, if any. */
  protected activeDay: { title: string; events: CalendarEvent[] } | null = null;
  private activeDayTrigger: MatMenuTrigger | null = null;

  /** Guards the view/date-driven re-query so it only runs after the initial one. */
  private initialized: boolean = false;

  /** Whether `locale` should follow the app's active language, same condition and pattern as `o-date-input`'s `updateLocaleOnChange`: only when no explicit `locale` input was bound. */
  private updateLocaleOnChange: boolean = false;
  private onLanguageChangeSubscription: Subscription;

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
    this.dateAdapter = this.injector.get(DateAdapter);
    // AbstractOServiceComponent defaults this to true, which makes
    // getPaginationDataFromArray() splice the response down to a single
    // "page" (queryRows, 32 by default) starting at currentPage * queryRows.
    // A calendar has no concept of pages — every event returned for the
    // active view's date range must be shown, or events silently vanish
    // whenever a range legitimately has more than queryRows of them (and,
    // if the backend's ordering isn't stable across requests, *which*
    // events make the cut can even change between identical queries).
    this.paginationControls = false;
  }

  ngOnInit(): void {
    this.initialize();
  }

  ngAfterViewInit(): void {
    super.afterViewInit();
    if (this.queryOnInit) {
      this.queryData();
    }
    this.initialized = true;
  }

  ngOnDestroy(): void {
    this.destroy();
    this.refresh$.complete();
    this.onLanguageChangeSubscription?.unsubscribe();
  }

  initialize(): void {
    super.initialize();
    if (!Util.isDefined(this.locale)) {
      this.updateLocaleOnChange = true;
      this.locale = this.translateService.getCurrentLang() || 'en';
    }
    // Only follows the app's active language when `locale` wasn't explicitly
    // bound, same condition `o-date-input`'s own `updateLocaleOnChange` uses:
    // an explicit input always wins over the app's language.
    if (this.updateLocaleOnChange) {
      this.onLanguageChangeSubscription = this.translateService.onLanguageChanged.subscribe(() => {
        this.locale = this.translateService.getCurrentLang();
        // toolbarTitle/day-number circles etc. are plain bindings, re-checked
        // on the next change detection run (triggered by this event handler
        // running inside the zone); angular-calendar's own internal views
        // (weekday headers, hour labels) only re-format on this refresh$ tick.
        Promise.resolve().then(() => this.refresh$.next());
      });
    }
  }

  /**
   * Restricts the outgoing query (service/entity mode) to the events visible
   * in the active view (month/week/day), so the backend only returns what the
   * calendar is about to render instead of the whole entity. Skipped in
   * static-data mode (queryData() never reaches this point) and when a
   * map-function is used, since there is no known start/end column to filter.
   */
  public override getComponentFilter(existingFilter: any = {}): any {
    const filter: any = super.getComponentFilter(existingFilter);
    const rangeExpr = this.buildViewRangeExpression();
    if (!rangeExpr) {
      return filter;
    }
    const key = FilterExpressionUtils.FILTER_EXPRESSION_KEY;
    filter[key] = filter[key]
      ? FilterExpressionUtils.buildComplexExpression(filter[key], rangeExpr, FilterExpressionUtils.OP_AND)
      : rangeExpr;
    return filter;
  }

  /**
   * Expression matching rows whose start/end overlaps the active view's date
   * range. The boundary values are converted to `value-type` first (default
   * `timestamp`, epoch ms — the same default Ontimize date filters use) so
   * they compare correctly against the actual `start-column`/`end-column`
   * values, whatever wire format those are stored in.
   */
  protected buildViewRangeExpression(): Expression | undefined {
    if (!Util.isDefined(this.startColumn) || typeof this.mapFunction === 'function') {
      return undefined;
    }
    const { start, end } = this.getViewRange();
    const rangeStart = Util.parseByValueType(start, this.valueType, this.valueFormat);
    const rangeEnd = Util.parseByValueType(end, this.valueType, this.valueFormat);
    const startsBeforeViewEnd = FilterExpressionUtils.buildExpressionLessEqual(this.startColumn, rangeEnd);
    if (!Util.isDefined(this.endColumn)) {
      const startsAfterViewStart = FilterExpressionUtils.buildExpressionMoreEqual(this.startColumn, rangeStart);
      return FilterExpressionUtils.buildComplexExpression(startsAfterViewStart, startsBeforeViewEnd, FilterExpressionUtils.OP_AND);
    }
    const endsAfterViewStart = FilterExpressionUtils.buildExpressionMoreEqual(this.endColumn, rangeStart);
    return FilterExpressionUtils.buildComplexExpression(startsBeforeViewEnd, endsAfterViewStart, FilterExpressionUtils.OP_AND);
  }

  /**
   * Date range actually rendered by the active view. Mirrors calendar-utils'
   * own month view boundaries (week-padded month) so the query matches
   * exactly what angular-calendar is about to display.
   */
  protected getViewRange(): { start: Date; end: Date } {
    if (this.isYearView) {
      return { start: this.startOfYear(this.viewDate), end: this.endOfYear(this.viewDate) };
    }
    const weekStartsOn = this.weekStartsOn;
    switch (this.calendarView) {
      case CalendarView.Week:
        return {
          start: this.dateAdapter.startOfWeek(this.viewDate, { weekStartsOn }),
          end: this.dateAdapter.endOfWeek(this.viewDate, { weekStartsOn })
        };
      case CalendarView.Day:
        return {
          start: this.dateAdapter.startOfDay(this.viewDate),
          end: this.dateAdapter.endOfDay(this.viewDate)
        };
      default:
        return {
          start: this.dateAdapter.startOfWeek(this.dateAdapter.startOfMonth(this.viewDate), { weekStartsOn }),
          end: this.dateAdapter.endOfWeek(this.dateAdapter.endOfMonth(this.viewDate), { weekStartsOn })
        };
    }
  }

  /**
   * Year arithmetic, built from the `DateAdapter` primitives it does expose
   * (`setMonth`/`setYear`/`startOfMonth`/`endOfMonth`) since angular-calendar's
   * `DateAdapter` interface has no year-level methods at all (no
   * `startOfYear`/`endOfYear`/`addYears`) — there is no native year view to
   * back them. Setting month to 0 (January) or 11 (December) before resetting
   * to start/end-of-month is always safe regardless of the original day of
   * month, since both months have 31 days.
   */
  private startOfYear(date: Date): Date {
    return this.dateAdapter.startOfMonth(this.dateAdapter.setMonth(date, 0));
  }
  private endOfYear(date: Date): Date {
    return this.dateAdapter.endOfMonth(this.dateAdapter.setMonth(date, 11));
  }
  private addYears(date: Date, amount: number): Date {
    return this.dateAdapter.setYear(date, this.dateAdapter.getYear(date) + amount);
  }

  /** Toolbar prev/next in year view: mwlCalendarPreviousView/NextView only know how to step day/week/month, so year navigation is handled here instead. */
  goToPreviousYear(): void {
    this.onViewDateChanged(this.addYears(this.viewDate, -1));
  }
  goToNextYear(): void {
    this.onViewDateChanged(this.addYears(this.viewDate, 1));
  }

  /** Re-queries the service once the view/date changes, skipped during initial setup. */
  private refreshQueryForView(): void {
    if (this.initialized) {
      this.queryData();
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
    this.indexEventsByDay();
    this.refresh$.next();
  }

  /**
   * Index of events by start day, keyed by `dayKey()`. `eventsForDay()` is
   * called once per rendered day cell — up to ~35 for month/agenda, but
   * ~420 for the year view's 12 mini-months — so re-filtering the whole
   * `events` array (O(days * events)) on every cell would scale badly there.
   * Rebuilt once whenever `events` changes instead.
   */
  private eventsByDay = new Map<string, CalendarEvent[]>();

  private indexEventsByDay(): void {
    this.eventsByDay = new Map();
    for (const event of this.events) {
      const key = this.dayKey(event.start);
      const bucket = this.eventsByDay.get(key);
      if (bucket) {
        bucket.push(event);
      } else {
        this.eventsByDay.set(key, [event]);
      }
    }
  }

  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  protected mapRowToEvent(row: any): CalendarEvent | undefined {
    if (typeof this.mapFunction === 'function') {
      return this.mapFunction(row);
    }
    const start = this.parseDate(row?.[this.startColumn]);
    if (!Util.isDefined(start)) {
      return undefined;
    }
    const columnEnd = Util.isDefined(this.endColumn) ? this.parseDate(row?.[this.endColumn]) : undefined;
    // No end-column, or an empty/invalid value for this row: default to the
    // end of the event's own day instead of leaving it end-less. Defaulting
    // to the active view's own range end instead (endOfMonth/Week/Day) was
    // tried first, but in month view that stretches the event all the way to
    // the last padded day of the month, rendering as one continuous bar
    // repeated across every cell in between instead of a single-day event.
    const end = columnEnd ?? this.dateAdapter.endOfDay(start!);
    const color = Util.isDefined(this.colorColumn) ? row?.[this.colorColumn] : undefined;

    const event: CalendarEvent = {
      start,
      end,
      title: Util.isDefined(this.titleColumn) ? String(row?.[this.titleColumn] ?? '') : '',
      meta: row
    };
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
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  /* -------------------- VIEW HANDLING -------------------- */

  setView(view: OCalendarView): void {
    if (view === 'year') {
      if (this.isYearView) {
        return;
      }
      this.isYearView = true;
      this.onViewChange.emit('year');
      this.refreshQueryForView();
      return;
    }
    const target = this.toCalendarView(view);
    const changed = target !== this.calendarView || this.isYearView;
    this.isYearView = false;
    if (!changed) {
      return;
    }
    this.calendarView = target;
    this.onViewChange.emit(this.fromCalendarView(target));
    this.refreshQueryForView();
  }

  /** i18n key for the toolbar view switch label (month -> 'MONTH', ...). */
  getViewLabel(view: OCalendarView): string {
    return VIEW_LABELS[view];
  }

  /** Long, localized title shown in the toolbar, e.g. "Viernes, 8 mayo 2026" (just the year number in year view). */
  get toolbarTitle(): string {
    return this.isYearView ? String(this.viewDate.getFullYear()) : this.formatLongDate(this.viewDate);
  }

  private formatLongDate(date: Date): string {
    // Intl.DateTimeFormat, not moment: it's backed by the browser's own ICU
    // data, so every locale is translated out of the box, matching the
    // toolbar's own date picker (provideNativeDateAdapter()) instead of
    // requiring an explicit `import 'moment/locale/xx'` per language.
    const formatted = new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /* -------------------- MONTH CELL HELPERS -------------------- */

  /** Events shown inside a month cell, capped by maxEventsPerMonthCell. */
  visibleEvents(day: { events?: CalendarEvent[] }): CalendarEvent[] {
    const events = day?.events ?? [];
    return events.slice(0, this.maxEventsPerMonthCell);
  }

  /** Number of events hidden behind the "+N more" link in a month cell. */
  hiddenEventsCount(day: { events?: CalendarEvent[] }): number {
    const total = day?.events?.length ?? 0;
    return Math.max(0, total - this.maxEventsPerMonthCell);
  }

  /**
   * Prepares and marks as active the day behind a "+N more" link, right before
   * its own `MatMenuTrigger` (passed in from the template) opens the shared
   * `dayEventsMenu` popover. Anchored to the clicked link, the CDK overlay
   * flips the popover to whichever side (right/left/top/bottom) fits the
   * viewport, instead of a centered modal.
   */
  prepareDayEventsMenu(day: { date: Date; events?: CalendarEvent[] }, trigger: MatMenuTrigger): void {
    this.activeDay = { title: this.formatLongDate(day.date), events: day?.events ?? [] };
    this.activeDayTrigger = trigger;
  }

  /**
   * Shared click handler for the `eventPillTemplate` used by the month cell,
   * the week/day agenda list and the "+N more" popover: optionally closes the
   * day popover first (only relevant when called from there), then re-emits
   * `onEventClick`.
   */
  onEventPillClicked(event: CalendarEvent, closePopover: boolean): void {
    if (closePopover) {
      this.activeDayTrigger?.closeMenu();
    }
    this.handleEventClicked(event);
  }

  /** Secondary/muted text of an event pill, taken from descriptionColumn. */
  getEventDescription(event: CalendarEvent): string {
    if (!Util.isDefined(this.descriptionColumn)) {
      return '';
    }
    const value = event?.meta?.[this.descriptionColumn];
    return Util.isDefined(value) ? String(value) : '';
  }

  /** Tooltip text for an event; an empty string disables the tooltip. */
  getEventTooltip(event: CalendarEvent): string {
    if (!this.showTooltip) {
      return '';
    }
    if (typeof this.tooltipFunction === 'function') {
      return String(this.tooltipFunction(event?.meta) ?? '');
    }
    const title = String(event?.title ?? '');
    const description = this.getEventDescription(event);
    return description ? `${title} · ${description}` : title;
  }

  /* -------------------- AGENDA (show-hours="no") VIEW HELPERS -------------------- */

  private weekDaysCacheKey: string | null = null;
  private weekDaysCache: Date[] = [];

  /**
   * Days of the visible week, respecting weekStartsOn and show-weekends.
   * Memoized by (viewDate, weekStartsOn, show-weekends): the `@for` in the
   * template tracks each day by its own identity, and this getter is
   * re-evaluated on every change detection run, so returning a fresh array of
   * fresh Date instances every time would give the loop a "new" collection on
   * every check — Angular can never match old vs new days, tearing down and
   * rebuilding the whole row and (observed in practice) leaving stale, unbound
   * copies of the previous render behind. Reusing the same array/Date
   * instances while nothing actually changed keeps the tracked identities
   * stable across checks.
   */
  get weekDays(): Date[] {
    const key = `${this.viewDate.getTime()}|${this.weekStartsOn}|${this.showWeekends}`;
    if (key === this.weekDaysCacheKey) {
      return this.weekDaysCache;
    }
    const start = this.dateAdapter.startOfWeek(this.viewDate, { weekStartsOn: this.weekStartsOn });
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = this.dateAdapter.addDays(start, i);
      if (!this.excludeDays.includes(day.getDay())) {
        days.push(day);
      }
    }
    this.weekDaysCacheKey = key;
    this.weekDaysCache = days;
    return days;
  }

  /** Events occurring on the given day, used by the agenda week/day list and the year view's day cells. */
  eventsForDay(date: Date): CalendarEvent[] {
    return this.eventsByDay.get(this.dayKey(date)) ?? [];
  }

  /** Whether the given date is today, used to highlight the agenda day header. */
  isToday(date: Date): boolean {
    return this.sameDay(date, new Date());
  }

  onViewDateChanged(date: Date): void {
    this.viewDate = date;
    this.onViewDateChange.emit(date);
    this.refreshQueryForView();
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

  /**
   * Toolbar date picker in year view: only the year matters, so the picker
   * opens straight into mat-calendar's multi-year grid and this closes it
   * right after a year is picked, instead of letting mat-calendar drill down
   * into its month/day views next (which would force picking a day just to
   * navigate the calendar to a year).
   */
  onPickerYearSelected(date: Date): void {
    this.onViewDateChanged(this.dateAdapter.setYear(this.viewDate, date.getFullYear()));
    if (this.datePickerTrigger) {
      this.datePickerTrigger.closeMenu();
    }
  }

  /**
   * Toolbar date picker in month view: only the month matters, so the picker
   * opens straight into mat-calendar's month grid (a year's 12 months) and
   * this closes it right after a month is picked, instead of letting
   * mat-calendar drill down into a day just to navigate the calendar to a
   * month.
   */
  onPickerMonthSelected(date: Date): void {
    const withMonth = this.dateAdapter.setMonth(this.viewDate, date.getMonth());
    this.onViewDateChanged(this.dateAdapter.setYear(withMonth, date.getFullYear()));
    if (this.datePickerTrigger) {
      this.datePickerTrigger.closeMenu();
    }
  }

  /* -------------------- YEAR VIEW HELPERS -------------------- */

  private yearGridCacheKey: string | null = null;
  private yearGridCache: { date: Date; days: { date: Date; inMonth: boolean }[] }[] = [];

  /**
   * The 12 months of the visible year, each with its own week-padded day
   * grid (same padding rule as the month view: `startOfWeek(startOfMonth)` ..
   * `endOfWeek(endOfMonth)`). Memoized by (year, weekStartsOn, show-weekends)
   * for the same reason `weekDays` is: a fresh getter evaluation returning new
   * Date instances every change-detection run would break the `@for` day
   * cells' `track` identity across the ~420 cells this view renders.
   */
  get yearMonths(): { date: Date; days: { date: Date; inMonth: boolean }[] }[] {
    const year = this.viewDate.getFullYear();
    const key = `${year}|${this.weekStartsOn}|${this.showWeekends}`;
    if (key === this.yearGridCacheKey) {
      return this.yearGridCache;
    }
    const weekStartsOn = this.weekStartsOn;
    const months: { date: Date; days: { date: Date; inMonth: boolean }[] }[] = [];
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 1);
      const gridStart = this.dateAdapter.startOfWeek(this.dateAdapter.startOfMonth(monthDate), { weekStartsOn });
      const gridEnd = this.dateAdapter.endOfWeek(this.dateAdapter.endOfMonth(monthDate), { weekStartsOn });
      const days: { date: Date; inMonth: boolean }[] = [];
      for (let day = gridStart; day.getTime() <= gridEnd.getTime(); day = this.dateAdapter.addDays(day, 1)) {
        if (!this.excludeDays.includes(day.getDay())) {
          days.push({ date: day, inMonth: day.getMonth() === m });
        }
      }
      months.push({ date: monthDate, days });
    }
    this.yearGridCacheKey = key;
    this.yearGridCache = months;
    return months;
  }

  private yearWeekdayLabelsCacheKey: string | null = null;
  private yearWeekdayLabelsCache: string[] = [];

  /** Short weekday labels ("Mon".."Sun") for the year grid's mini-month headers, respecting weekStartsOn/show-weekends. */
  get yearWeekdayLabels(): string[] {
    const key = `${this.locale}|${this.weekStartsOn}|${this.showWeekends}`;
    if (key === this.yearWeekdayLabelsCacheKey) {
      return this.yearWeekdayLabelsCache;
    }
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
    this.yearWeekdayLabelsCache = this.weekDays.map(day => formatter.format(day));
    this.yearWeekdayLabelsCacheKey = key;
    return this.yearWeekdayLabelsCache;
  }

  /** Localized month name for a mini-month header, e.g. "January". Intl-based like formatLongDate, so every locale works without an explicit moment locale import. */
  formatMonthTitle(date: Date): string {
    const formatted = new Intl.DateTimeFormat(this.locale, { month: 'long' }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /** Year view day cell click: only re-emits onDayClick (no built-in popover or view switch) so the consumer decides what happens. */
  handleYearDayClicked(date: Date): void {
    this.onDayClick.emit({ date, events: this.eventsForDay(date) });
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
