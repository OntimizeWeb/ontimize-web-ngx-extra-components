import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';
import {
  APP_CONFIG,
  AppConfig,
  appConfigFactory,
  AuthService,
  FilterExpressionUtils,
  LocalStorageService,
  NavigationService,
  OErrorDialogManager,
  Util
} from 'ontimize-web-ngx';

import { OCalendarComponent } from './o-calendar.component';

/**
 * Minimal DI surface for AbstractOServiceComponent/AbstractOServiceBaseComponent
 * (see their constructors in ontimize-web-ngx). Router/AuthService/NavigationService/
 * OErrorDialogManager are mocked outright since none of their real behaviour is
 * exercised by these tests — only their presence in the injector is required so
 * OCalendarComponent's constructor (and LocalStorageService's) doesn't throw.
 * Every other required service (DialogService, PermissionsService, OTranslateService,
 * MomentService, LuxonService, TranslateExtraComponentsService...) is `providedIn:
 * 'root'` and only needs AppConfig/MatDialog/HttpClient, provided below.
 */
function configureCalendarTestingModule(): void {
  const mockConfig = { uuid: 'com.ontimize.web.extra-components.test', title: 'O-Calendar Testing', locale: 'en' };
  const routerStub = {
    url: '/',
    events: of(),
    // ontimize-web-ngx's APP_INITIALIZER (see the NavigationService note below) also
    // runs addPermissionsRouteGuard(), which reads route.config to add the 403 route.
    config: [],
    navigate: () => Promise.resolve(true),
    navigateByUrl: () => Promise.resolve(true)
  };

  TestBed.configureTestingModule({
    imports: [
      OCalendarComponent,
      NoopAnimationsModule,
      HttpClientTestingModule,
      TranslateModule.forRoot(),
      MatDialogModule
    ],
    providers: [
      { provide: APP_CONFIG, useValue: mockConfig },
      { provide: AppConfig, useFactory: appConfigFactory, deps: [Injector] },
      { provide: Router, useValue: routerStub },
      {
        provide: ActivatedRoute,
        useValue: { params: of({}), queryParams: of({}), snapshot: { params: {}, queryParams: {}, data: {} } }
      },
      { provide: AuthService, useValue: {} },
      { provide: LocalStorageService, useClass: LocalStorageService, deps: [Injector] },
      // 'initialize' is required too: ontimize-web-ngx's own APP_INITIALIZER calls
      // injector.get(NavigationService).initialize() as part of app bootstrap, which
      // TestBed still runs here — an incomplete spy throws "is not a function" from
      // that initializer's pending promise, and (with `destroyAfterEach: false` in
      // test.ts) that throw surfaces later, attributed to whatever spec runs next.
      { provide: NavigationService, useValue: jasmine.createSpyObj('NavigationService', ['initialize', 'navigate', 'getPreviousRouteData', 'getLastItem']) },
      { provide: OErrorDialogManager, useValue: jasmine.createSpyObj('OErrorDialogManager', ['openErrorDialog']) }
    ]
  });
}

describe('OCalendarComponent', () => {
  let fixture: ComponentFixture<OCalendarComponent>;
  let component: OCalendarComponent;

  beforeEach(async () => {
    configureCalendarTestingModule();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(OCalendarComponent);
    component = fixture.componentInstance;
  });

  it('creates the component and can initialize/destroy without throwing', () => {
    expect(component).toBeTruthy();
    component.staticData = [];
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.view).toBe('month');
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('initialize() with static-data populates events directly, bypassing the service query', () => {
    component.startColumn = 'start';
    component.titleColumn = 'title';
    component.staticData = [{ start: new Date(2026, 0, 1), title: 'Kickoff' }];
    component.ngOnInit();

    expect(component.events.length).toBe(1);
    expect(component.events[0].title).toBe('Kickoff');
  });

  describe('view switching', () => {
    it('defaults to month view and the default view set', () => {
      expect(component.view).toBe('month');
      expect(component.views).toEqual(['day', 'week', 'month']);
    });

    it('views setter parses a string list, drops unknown views, and falls back to the default set when nothing valid remains', () => {
      component.views = 'month;bogus;week';
      expect(component.views).toEqual(['month', 'week']);

      component.views = 'nope';
      expect(component.views).toEqual(['day', 'week', 'month']);
    });

    it('setView switches the active view and only emits onViewChange on a real change', () => {
      const spy = spyOn(component.onViewChange, 'emit');
      component.setView('week');
      expect(component.view).toBe('week');
      expect(spy).toHaveBeenCalledWith('week');

      spy.calls.reset();
      component.setView('week');
      expect(spy).not.toHaveBeenCalled();
    });

    it('setView("year") is idempotent and leaving it restores the previous calendar view', () => {
      const spy = spyOn(component.onViewChange, 'emit');
      component.setView('week');
      spy.calls.reset();

      component.setView('year');
      expect(component.view).toBe('year');
      expect(spy).toHaveBeenCalledWith('year');

      spy.calls.reset();
      component.setView('year');
      expect(spy).not.toHaveBeenCalled();

      component.setView('week');
      expect(component.view).toBe('week');
    });

    it('getViewLabel maps each view to its i18n key', () => {
      expect(component.getViewLabel('month')).toBe('MONTH');
      expect(component.getViewLabel('week')).toBe('WEEK');
      expect(component.getViewLabel('day')).toBe('DAY');
      expect(component.getViewLabel('year')).toBe('YEAR');
    });

    it('isWeekHeaderFormatWide is false for the default "D" format and true for any other', () => {
      expect(component.isWeekHeaderFormatWide).toBe(false);
      component.weekHeaderDayFormat = 'MMM D';
      expect(component.isWeekHeaderFormatWide).toBe(true);
    });
  });

  describe('toolbar title and view range', () => {
    it('toolbarTitle shows only the year number in year view', () => {
      component.viewDate = new Date(2026, 0, 1);
      component.setView('year');
      expect(component.toolbarTitle).toBe('2026');
    });

    it('toolbarTitle shows a capitalized long date in month/week/day views', () => {
      component.locale = 'en';
      component.viewDate = new Date(2026, 0, 5);
      const title = component.toolbarTitle;
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
      expect(title).toContain('2026');
    });

    it('getViewRange spans the week-padded month by default', () => {
      component.weekStartsOn = 1;
      component.viewDate = new Date(2026, 3, 15);
      const range = (component as any).getViewRange();
      expect(range.start.getDay()).toBe(1);
      expect(range.start.getTime()).toBeLessThanOrEqual(new Date(2026, 3, 1).getTime());
      expect(range.end.getTime()).toBeGreaterThanOrEqual(new Date(2026, 3, 30, 23, 59, 59).getTime());
    });

    it('getViewRange covers a single day in day view', () => {
      component.setView('day');
      component.viewDate = new Date(2026, 3, 15, 10, 30);
      const range = (component as any).getViewRange();
      expect(range.start.getHours()).toBe(0);
      expect(range.end.getHours()).toBe(23);
      expect(range.start.getDate()).toBe(15);
    });

    it('getViewRange spans the whole year in year view', () => {
      component.viewDate = new Date(2026, 5, 15);
      component.setView('year');
      const range = (component as any).getViewRange();
      expect(range.start.getFullYear()).toBe(2026);
      expect(range.start.getMonth()).toBe(0);
      expect(range.end.getMonth()).toBe(11);
    });
  });

  describe('server-side view range filter', () => {
    it('buildViewRangeExpression is undefined without start-column, or when a map-function is set', () => {
      expect((component as any).buildViewRangeExpression()).toBeUndefined();

      component.startColumn = 'start';
      component.mapFunction = () => ({ start: new Date(), title: '' } as CalendarEvent);
      expect((component as any).buildViewRangeExpression()).toBeUndefined();
    });

    it('without end-column, filters start-column between the view range (default timestamp value-type)', () => {
      component.startColumn = 'start';
      component.setView('day');
      component.viewDate = new Date(2026, 3, 15);
      const range = (component as any).getViewRange();

      const expr: any = (component as any).buildViewRangeExpression();
      expect(expr.op).toBe(FilterExpressionUtils.OP_AND);
      expect(expr.lop).toEqual({ lop: 'start', op: FilterExpressionUtils.OP_MORE_EQUAL, rop: range.start.getTime() });
      expect(expr.rop).toEqual({ lop: 'start', op: FilterExpressionUtils.OP_LESS_EQUAL, rop: range.end.getTime() });
    });

    it('with end-column, filters start<=viewEnd AND end>=viewStart', () => {
      component.startColumn = 'start';
      component.endColumn = 'end';
      component.setView('day');
      component.viewDate = new Date(2026, 3, 15);
      const range = (component as any).getViewRange();

      const expr: any = (component as any).buildViewRangeExpression();
      expect(expr.op).toBe(FilterExpressionUtils.OP_AND);
      expect(expr.lop).toEqual({ lop: 'start', op: FilterExpressionUtils.OP_LESS_EQUAL, rop: range.end.getTime() });
      expect(expr.rop).toEqual({ lop: 'end', op: FilterExpressionUtils.OP_MORE_EQUAL, rop: range.start.getTime() });
    });

    it('respects value-type when building the range boundaries (e.g. iso-8601 instead of the default epoch ms)', () => {
      component.startColumn = 'start';
      component.valueType = 'iso-8601';
      component.setView('day');
      component.viewDate = new Date(2026, 3, 15);
      const range = (component as any).getViewRange();
      const expectedStart = Util.parseByValueType(range.start, 'iso-8601', component.valueFormat);

      const expr: any = (component as any).buildViewRangeExpression();
      expect(typeof expr.lop.rop).toBe('string');
      expect(expr.lop.rop).toBe(expectedStart);
    });

    it('getComponentFilter merges the range expression into an existing filter with AND', () => {
      component.startColumn = 'start';
      component.setView('day');
      const key = FilterExpressionUtils.FILTER_EXPRESSION_KEY;
      const existing = FilterExpressionUtils.buildExpressionEquals('active', true);

      const filter = component.getComponentFilter({ [key]: existing });
      expect(filter[key].op).toBe(FilterExpressionUtils.OP_AND);
      expect(filter[key].lop).toEqual(existing);
    });

    it('getComponentFilter is unchanged when there is no start-column configured', () => {
      const filter = component.getComponentFilter({});
      expect(filter[FilterExpressionUtils.FILTER_EXPRESSION_KEY]).toBeUndefined();
    });
  });

  describe('event mapping', () => {
    it('maps a row into a CalendarEvent, defaulting end to the end of the start day', () => {
      component.startColumn = 'start';
      component.titleColumn = 'title';
      const start = new Date(2026, 2, 10, 9, 0).getTime();
      const event: any = (component as any).mapRowToEvent({ start, title: 'Meeting' });

      expect(event.title).toBe('Meeting');
      expect(event.start.getTime()).toBe(start);
      expect(event.end.getHours()).toBe(23);
      expect(event.end.getMinutes()).toBe(59);
    });

    it('returns undefined when the start value is missing or invalid', () => {
      component.startColumn = 'start';
      expect((component as any).mapRowToEvent({})).toBeUndefined();
      expect((component as any).mapRowToEvent({ start: 'not-a-date' })).toBeUndefined();
    });

    it('uses end-column when present and valid', () => {
      component.startColumn = 'start';
      component.endColumn = 'end';
      const start = new Date(2026, 2, 10, 9, 0);
      const end = new Date(2026, 2, 10, 10, 0);
      const event: any = (component as any).mapRowToEvent({ start, end });
      expect(event.end).toEqual(end);
    });

    it('sets color and allDay from their columns when configured', () => {
      component.startColumn = 'start';
      component.colorColumn = 'color';
      component.allDayColumn = 'allDay';
      const event: any = (component as any).mapRowToEvent({ start: new Date(), color: '#fff', allDay: true });
      expect(event.color).toEqual({ primary: '#fff', secondary: '#fff' });
      expect(event.allDay).toBe(true);
    });

    it('delegates to map-function when provided, taking precedence over column inputs', () => {
      const custom: CalendarEvent = { start: new Date(2020, 0, 1), title: 'Custom' };
      component.startColumn = 'start';
      component.mapFunction = () => custom;
      expect((component as any).mapRowToEvent({ start: new Date() })).toBe(custom);
    });
  });

  describe('setDataArray / day indexing', () => {
    it('builds events from rows and indexes them by day for eventsForDay', () => {
      component.startColumn = 'start';
      component.titleColumn = 'title';
      const day = new Date(2026, 4, 4, 8, 0);
      const otherDay = new Date(2026, 4, 5, 8, 0);

      component.setDataArray([
        { start: day, title: 'A' },
        { start: day, title: 'B' },
        { start: otherDay, title: 'C' }
      ]);

      expect(component.events.length).toBe(3);
      expect(component.eventsForDay(day).map(e => e.title)).toEqual(['A', 'B']);
      expect(component.eventsForDay(otherDay).map(e => e.title)).toEqual(['C']);
      expect(component.eventsForDay(new Date(2000, 0, 1))).toEqual([]);
    });
  });

  describe('month cell helpers', () => {
    it('visibleEvents/hiddenEventsCount cap the day cell to maxEventsPerMonthCell', () => {
      component.maxEventsPerMonthCell = 2;
      const events = [1, 2, 3, 4].map(i => ({ start: new Date(), title: `E${i}` } as CalendarEvent));
      const day = { events };

      expect(component.visibleEvents(day).length).toBe(2);
      expect(component.hiddenEventsCount(day)).toBe(2);
      expect(component.hiddenEventsCount({ events: [] })).toBe(0);
    });

    it('prepareDayEventsMenu captures the day title and events for the popover', () => {
      const ev: CalendarEvent = { start: new Date(), title: 'A' };
      const day = { date: new Date(2026, 0, 10), events: [ev] };
      const triggerSpy = jasmine.createSpyObj<MatMenuTrigger>('MatMenuTrigger', ['closeMenu']);

      component.prepareDayEventsMenu(day, triggerSpy);
      expect((component as any).activeDay.events).toEqual([ev]);
    });

    it('onEventPillClicked closes the popover trigger only when asked to, and always re-emits onEventClick', () => {
      const ev: CalendarEvent = { start: new Date(), title: 'A', meta: { id: 1 } };
      const triggerSpy = jasmine.createSpyObj<MatMenuTrigger>('MatMenuTrigger', ['closeMenu']);
      component.prepareDayEventsMenu({ date: new Date(), events: [ev] }, triggerSpy);

      const emitSpy = spyOn(component.onEventClick, 'emit');
      component.onEventPillClicked(ev, true);
      expect(triggerSpy.closeMenu).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ event: ev, row: ev.meta });

      triggerSpy.closeMenu.calls.reset();
      emitSpy.calls.reset();
      component.onEventPillClicked(ev, false);
      expect(triggerSpy.closeMenu).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ event: ev, row: ev.meta });
    });
  });

  describe('event description and tooltip', () => {
    const baseEvent = (): CalendarEvent => ({ start: new Date(), title: 'Title', meta: { desc: 'Desc' } });

    it('getEventDescription reads description-column from event.meta', () => {
      expect(component.getEventDescription(baseEvent())).toBe('');
      component.descriptionColumn = 'desc';
      expect(component.getEventDescription(baseEvent())).toBe('Desc');
    });

    it('getEventTooltip is empty when show-tooltip is disabled', () => {
      component.showTooltip = false;
      expect(component.getEventTooltip(baseEvent())).toBe('');
    });

    it('getEventTooltip uses tooltip-function over the default title/description text', () => {
      component.tooltipFunction = (row: any) => `custom:${row.desc}`;
      expect(component.getEventTooltip(baseEvent())).toBe('custom:Desc');
    });

    it('getEventTooltip falls back to "title" or "title · description"', () => {
      const event = baseEvent();
      expect(component.getEventTooltip(event)).toBe('Title');
      component.descriptionColumn = 'desc';
      expect(component.getEventTooltip(event)).toBe('Title · Desc');
    });
  });

  describe('agenda (show-hours="no") week helpers', () => {
    it('weekDays is memoized while viewDate/weekStartsOn/showWeekends stay the same', () => {
      component.viewDate = new Date(2026, 3, 8);
      const days = component.weekDays;
      expect(component.weekDays).toBe(days);

      component.viewDate = new Date(component.viewDate.getTime());
      expect(component.weekDays).toBe(days);

      component.viewDate = new Date(2026, 3, 15);
      expect(component.weekDays).not.toBe(days);
    });

    it('weekDays excludes Saturday/Sunday when show-weekends is off', () => {
      component.showWeekends = true;
      expect(component.weekDays.length).toBe(7);

      component.showWeekends = false;
      expect(component.weekDays.length).toBe(5);
      component.weekDays.forEach(d => expect([0, 6]).not.toContain(d.getDay()));
    });

    it('isToday matches only the current date', () => {
      expect(component.isToday(new Date())).toBe(true);
      expect(component.isToday(new Date(2000, 0, 1))).toBe(false);
    });
  });

  describe('year view helpers', () => {
    it('yearMonths returns 12 padded month grids, memoized while year/weekStartsOn/showWeekends stay the same', () => {
      component.viewDate = new Date(2026, 5, 15);
      const months = component.yearMonths;
      expect(months.length).toBe(12);
      months.forEach(m => expect(m.days.length % 7).toBe(0));
      expect(component.yearMonths).toBe(months);

      component.weekStartsOn = 1;
      expect(component.yearMonths).not.toBe(months);
    });

    it('formatMonthTitle returns a capitalized localized month name', () => {
      component.locale = 'en';
      const title = component.formatMonthTitle(new Date(2026, 0, 1));
      expect(title.charAt(0)).toBe(title.charAt(0).toUpperCase());
      expect(title.toLowerCase()).toContain('january');
    });

    it('handleYearDayClicked only emits onDayClick, without switching the active view', () => {
      component.startColumn = 'start';
      const day = new Date(2026, 3, 10);
      component.setDataArray([{ start: day, title: 'A' }]);

      const spy = spyOn(component.onDayClick, 'emit');
      component.handleYearDayClicked(day);
      expect(spy).toHaveBeenCalledWith({ date: day, events: component.eventsForDay(day) });
      expect(component.view).toBe('month');
    });
  });

  describe('click handlers', () => {
    it('handleDayClicked emits onDayClick with the cell events', () => {
      const spy = spyOn(component.onDayClick, 'emit');
      const day = { date: new Date(2026, 0, 1), events: [] as CalendarEvent[] };
      component.handleDayClicked(day);
      expect(spy).toHaveBeenCalledWith({ date: day.date, events: [] });
    });

    it('handleHourSegmentClicked emits onDayClick with events matching that day only', () => {
      component.startColumn = 'start';
      component.titleColumn = 'title';
      component.setDataArray([
        { start: new Date(2026, 0, 1, 10, 0), title: 'A' },
        { start: new Date(2026, 0, 2), title: 'B' }
      ]);

      const spy = spyOn(component.onDayClick, 'emit');
      component.handleHourSegmentClicked(new Date(2026, 0, 1, 14, 0));
      const arg = spy.calls.mostRecent().args[0];
      expect(arg.events.length).toBe(1);
      expect(arg.events[0].title).toBe('A');
    });

    it('handleEventClicked emits onEventClick with the source row', () => {
      const spy = spyOn(component.onEventClick, 'emit');
      const event: CalendarEvent = { start: new Date(), title: 'A', meta: { id: 1 } };
      component.handleEventClicked(event);
      expect(spy).toHaveBeenCalledWith({ event, row: event.meta });
    });
  });

  describe('date navigation', () => {
    it('onViewDateChanged updates viewDate and emits onViewDateChange', () => {
      const spy = spyOn(component.onViewDateChange, 'emit');
      const date = new Date(2026, 6, 1);
      component.onViewDateChanged(date);
      expect(component.viewDate).toBe(date);
      expect(spy).toHaveBeenCalledWith(date);
    });

    it('onPickerDateSelected navigates to the picked date and ignores a null pick', () => {
      const spy = spyOn(component, 'onViewDateChanged').and.callThrough();
      const date = new Date(2026, 6, 2);
      component.onPickerDateSelected(date);
      expect(spy).toHaveBeenCalledWith(date);

      spy.calls.reset();
      component.onPickerDateSelected(null);
      expect(spy).not.toHaveBeenCalled();
    });

    it('goToPreviousYear/goToNextYear step the view date by a year, keeping month and day', () => {
      component.viewDate = new Date(2026, 4, 15);
      component.goToNextYear();
      expect(component.viewDate.getFullYear()).toBe(2027);
      expect(component.viewDate.getMonth()).toBe(4);
      expect(component.viewDate.getDate()).toBe(15);

      component.goToPreviousYear();
      expect(component.viewDate.getFullYear()).toBe(2026);
    });

    it('onPickerYearSelected updates only the year', () => {
      component.viewDate = new Date(2026, 4, 15);
      component.onPickerYearSelected(new Date(2030, 0, 1));
      expect(component.viewDate.getFullYear()).toBe(2030);
      expect(component.viewDate.getMonth()).toBe(4);
    });

    it('onPickerMonthSelected updates month and year, keeping the day', () => {
      component.viewDate = new Date(2026, 4, 15);
      component.onPickerMonthSelected(new Date(2030, 8, 1));
      expect(component.viewDate.getFullYear()).toBe(2030);
      expect(component.viewDate.getMonth()).toBe(8);
      expect(component.viewDate.getDate()).toBe(15);
    });
  });

  describe('reactive formatting inputs', () => {
    it('weekStartsOn only accepts 0-6 and schedules a refresh', async () => {
      const spy = spyOn(component.refresh$, 'next');
      component.weekStartsOn = 3;
      expect(component.weekStartsOn).toBe(3);
      await Promise.resolve();
      expect(spy).toHaveBeenCalled();

      component.weekStartsOn = 10;
      expect(component.weekStartsOn).toBeUndefined();
    });

    it('showTooltip toggles the title formatter and schedules a refresh', async () => {
      const spy = spyOn(component.refresh$, 'next');
      component.showTooltip = false;
      expect(component.showTooltip).toBe(false);
      expect((component as any).titleFormatter.tooltipsEnabled).toBe(false);
      await Promise.resolve();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('rendering (integration smoke test)', () => {
    it('renders the toolbar and an event pill for static data without throwing', () => {
      component.startColumn = 'start';
      component.titleColumn = 'title';
      component.staticData = [{ start: new Date(), title: 'Team sync' }];

      expect(() => fixture.detectChanges()).not.toThrow();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelectorAll('.o-calendar-view-toggle .o-calendar-view-btn').length).toBeGreaterThan(0);
      expect(compiled.textContent).toContain('Team sync');
    });
  });
});
