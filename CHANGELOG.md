## 18.0.0-next.5 (2026-09-11)

### Features
* **o-calendar**: add a `year` view — a 12-month mini-calendar grid — opt-in via the `views` input
* **o-calendar**: the toolbar's "jump to date" picker now matches the active view's granularity (a month picker in month view, a year picker in year view) instead of always asking for a full day
* **o-collection-editor**: add new component for editing two-level collections (groups, each with its own items), generic over `<G, I>` — it owns only the structural chrome (numbering, add/remove, drag handles, empty state, validation) and projects the consumer's own controls for the actual fields; works inside `<o-form>` (via `attr`), a native `[formGroup]` (via `formControlName`) or standalone (via `[(ngModel)]`)
  * `group-items-column` input names the property that holds a group's items
  * `remove-group-handler` / `remove-item-handler` for deferred (async) removal, with busy rows and rollback on failure
  * drag & drop reordering (`@angular/cdk/drag-drop`), with an accessible keyboard move up/down alternative
  * structural validation (`min-groups`, `min-items-per-group`) as errors on the component's own `FormControl`, plus `validateStructure()` for `o-form`'s summary dialog
  * `action-styles` support for every built-in button, same system as `o-form` / `o-table` / `o-grid` / `o-list` / `o-tree`
  * `data-testid` forwarded to every button and to each group/item row, for E2E testing

## 18.0.0-next.4 (2026-08-20)

### Miscellaneous
* **deps**: bump `ngx-extended-pdf-viewer` from `^19.0.0` to `^20.0.0`

## 18.0.0-next.3 (2026-07-20)

### Breaking Changes
* **o-calendar**: rename `max-events-per-cell` to `max-events-per-month-cell`, to make explicit that it only applies to the month view's day cells (not week/day, which have no "+N more" mechanism)

### Features
* **o-calendar**: bundle `angular-calendar`'s structural layout styles (flex, spacing, sizing — not its color theming) directly into the component via its scss source (`angular-calendar/scss/angular-calendar`), so consuming apps no longer need to add `node_modules/angular-calendar/css/angular-calendar.css` to their own `angular.json` `styles`
* **o-calendar**: add `empty-cell-text` input — customizes (or clears, with `''`) the placeholder text shown in place of a day's event list in the agenda (`show-hours="no"`) when it has no events; previously a hardcoded `···`
* **o-calendar**: add `more-clickable` input — set to `no` to render the month view's `+N more` indicator as a static label instead of a button that opens the day events popover
* **o-calendar**: show a loading skeleton (`ngx-skeleton-loader`) while a service/entity query is in flight, using the `loading` observable already inherited from `AbstractOServiceBaseComponent` — shaped like an agenda (a day-number circle, a weekday label in week/day, and a few varying-width event-card bars) rather than one flat block, and like the active view's own layout, cell/column dividers included (month grid, or one column per visible day for week/day)

### Bug Fixes
* **o-calendar**: default an event's `end` to the end of its own start day when `end-column` isn't configured, or a row's value is empty/invalid, instead of leaving the event end-less
* **o-calendar**: fix unwanted scrollbar in the week agenda (`show-hours="no"`) — `.o-cal-agenda-week` combined `height: 100%` with a border and the default `content-box` sizing, so the border added 1px on top of the container's own height, just enough to overflow it and trigger the scroll
* **o-calendar**: fix `toolbarTitle` not translating when `locale` changes — it was formatted with `moment(date).locale(...)`, which silently falls back to `en` for any locale not explicitly registered via `import 'moment/locale/xx'`; now formatted with `Intl.DateTimeFormat`, matching the toolbar's own date picker (`provideNativeDateAdapter()`), so every locale works out of the box
* **o-calendar**: fix weekday names not translating in the month view header row and the week/day view's own header — same root cause as `toolbarTitle` (angular-calendar's stock `monthViewColumnHeader`/`weekViewColumnHeader` formatters use `moment(date).locale(...)`); both overridden in `OCalendarDateFormatter` with `Intl.DateTimeFormat`
* **o-calendar**: fix `locale` (and everything derived from it — `toolbarTitle`, weekday headers) never updating after the app's active language changed — `locale` was only read once from `ontimize-web-ngx`'s translate service at init; now, when it isn't explicitly bound, it subscribes to `onLanguageChanged` and re-renders, same pattern `o-date-input`'s `updateLocaleOnChange` already uses
* **o-calendar**: fix event text in the week/day hourly grid stuck at a hard-coded 12px — `angular-calendar`'s own `.cal-event` rule sets `font-size: 12px` and our override didn't touch it; now uses the same `--mat-sys-label-medium-size` token as the month/agenda event pills, so it follows the app's configured density like the rest of the component
* **o-calendar**: the active view-switch button (month/week/day) now uses Material's `mat-flat-button` instead of `mat-stroked-button`, matching its filled active look
* **o-calendar**: fix custom `oCalendarEvent` templates losing the default pill's background and event-colored left border — the month cell, week agenda, day agenda and "+N more" popover wrappers now all apply the same background/left-border classes as the default pill, and the week/day real grid's custom event wrapper (which keeps `angular-calendar`'s own `.cal-event` for its structural sizing/positioning) gets the same per-event border color too, instead of being locked to the theme's primary color
* **o-calendar**: fix the week/day column header's day number (`week-header-day-format`) not translating for its two documented values (`D`, `MMM D`) — same `moment(date).locale(...)` root cause as the rest; now formatted with `Intl.DateTimeFormat` like everything else, with moment kept only as a fallback for any other, free-form moment token
* **o-calendar**: fix events silently disappearing (and which ones varying between otherwise-identical queries) when a view's date range legitimately has more of them than `query-rows` (32 by default) — `AbstractOServiceComponent` defaults `pagination-controls` to `true`, which slices the response down to a single page starting at `currentPage * queryRows`; a calendar has no notion of pages, so `o-calendar` now forces it to `false`

### Miscellaneous
* **o-calendar**: unify the month cell, week/day agenda list and "+N more" popover's event rendering (custom `oCalendarEvent` template or default pill) into a single shared `eventPillTemplate`, removing three duplicated copies of the same markup
* **o-calendar**: remove the dead, commented-out `.o-calendar-view-btn` scss rule left over from before the view-switch buttons became `mat-stroked-button`/`mat-flat-button`; the active button now uses `color="primary"` instead
* **o-calendar**: move the event's left-border color out of the templates — instead of a `[style.borderLeftColor]` binding (and the `getEventColor()` method computing it) repeated in every view, a single shared `.o-cal-event` class owns the border's width/style/theme-fallback, fed by a `[style.--o-cal-event-color]` custom property set to the event's own `color-column` value (or left unset, falling through to the theme's primary color)
* **o-calendar**: add an `o-calendar` host class, matching the component's own selector — the same convention every `ontimize-web-ngx` component follows

## 18.0.0-next.2 (2026-07-10)

### Features
* **o-calendar**: add new component for displaying data rows as events over month/week/day views, backed by `angular-calendar` with a `moment` date adapter and formatter
  * data binding via `static-data` or `service`/`entity`, mapping rows to events through `*-column` inputs (`start-column`, `end-column`, `title-column`, `description-column`, `color-column`, `all-day-column`) or a custom `map-function`
  * toolbar with previous/next navigation, a clickable title that opens a date picker to jump to any day/month/year, and a view switch (`views`)
  * `week-starts-on` and `week-header-day-format` inputs to control the first day of the week and the week/day column header format, independent of the active moment locale
  * `oCalendarEvent` / `oCalendarTooltip` content-projection templates to fully customize the event pill and its tooltip in every view
  * `show-tooltip` input, and a `title` input rendered at the left of the toolbar
  * `tooltip-function` input — a `(row: any) => string` for a lighter-weight tooltip text override than a full `oCalendarTooltip` template, matching the convention of `o-table-column`'s own `tooltip-function`
  * "+N more" link in month cells (capped by `max-events-per-cell`) opens a popover, anchored to the link and auto-flipped by the CDK overlay to whichever side fits the viewport, listing every event of that day, reusing the same templates and re-emitting `onEventClick` when an event is picked
  * `show-hours` input: when `no`, replaces the week/day hourly grid with an agenda-style list of event cards per day (one column per day in week view), for calendars with all-day-only events
  * day view header (weekday + day number, today highlighted), always shown regardless of `show-hours` — above the hourly grid or above the agenda list
  * `show-weekends` input to hide Saturday/Sunday columns in the month and week views (and in the week agenda list)
  * `onEventClick`, `onDayClick`, `onViewChange` and `onViewDateChange` outputs
* **o-calendar**: restrict service/entity queries to the events overlapping the active view's date range (week-padded month, week or day), rebuilt from `start-column`/`end-column` on every navigation (previous/next, view switch, date picker), instead of always fetching the whole entity — via a `getComponentFilter` override, following the same pattern as `o-table`'s own filter merging
* **o-calendar**: add `value-type` (default `timestamp`) and `value-format` inputs — the view-range filter boundaries are converted through `Util.parseByValueType` before being sent, so they compare correctly against whatever wire format `start-column`/`end-column` are actually stored in, matching the convention `o-date-input`/`o-table` date filters already use

### Bug Fixes
* **o-calendar**: fix unreadable text on alternating hour rows and hover states in week/day views under dark themes — `angular-calendar`'s stock CSS hard-codes light grays (`#fafafa`/`#ededed`) that are now themed with Material 3 tokens
* **o-calendar**: fix uneven month cell widths when an event title is long — flex item was missing `min-width: 0`, preventing the cell from shrinking and the event text from ellipsizing
* **o-calendar**: fix event hover flicker — the tooltip was inserted as a sibling inside the tightly-packed cell/list, and its reflow could push the pointer off the event, re-triggering `mouseenter`/`mouseleave` in a loop; now appended to `document.body` (`tooltipAppendToBody`)
* **o-calendar**: fix duplicated, unbound day columns in the `show-hours="no"` week agenda — `weekDays` was a getter returning a fresh array of fresh `Date` instances on every change-detection run, so the `@for` tracking each day by its own identity could never match old vs new days and left stale copies behind; now memoized by (viewDate, weekStartsOn, show-weekends) so the same instances are reused across checks
* **o-calendar**: fix misaligned bottom border on today's agenda week header — the today day-number (a fixed-size circle) and the other days' (plain text with `line-height`) rendered at different heights, making that one column's header taller than the rest; the fixed-size box is now applied regardless of today/not-today
* **o-calendar**: unify the "today" cell/column styling across month, week and day views — month used a box-shadow outline while week/day used a background tint; all three now use the same background tint (`--o-cal-today-tint`) and a 24px filled circle on the day number
* **o-calendar**: unify the day-number text style across views — the week/day grid view's own day number rendered at 16px (`title-medium`) while month's and the agenda's rendered at 13px (`label-large`); all three now use the same size, weight and circle padding
* **o-calendar**: fix oval (instead of circular) today background in month and day views — the circle used `min-width` plus horizontal `padding`, so the box grew wider than tall as soon as the padding was added; now a fixed `width`/`height` with no padding, guaranteeing a perfect circle regardless of the day-number's digit count
* **o-calendar**: fix darker today background on the week agenda's day header — the same translucent tint was being painted twice (once on the day column, once again on the header inside it), stacking into a visibly darker shade than every other "today" tint in the calendar; the header no longer repaints it, it now shows through from the column, and the day view's (unwrapped) header gets the tint directly so it still renders one even layer
* **o-calendar**: fix today circle clipping/stretching in the week view header when `week-header-day-format` is set to anything other than the default `D` — a longer value (e.g. `MMM D` → "Jul 16") no longer fits a 24px circle, so it now renders as a 12px-radius rounded-rect pill instead, sized to its content
* **o-calendar**: fix custom `oCalendarTooltip` template never appearing on hover — its wrapper (`.o-cal-tooltip`) was missing `position: absolute`, which `angular-calendar`'s own default tooltip class sets and relies on to apply the `top`/`left` it computes in JS to anchor the tooltip next to the hovered event; without it, the tooltip rendered in normal document flow at the end of `<body>` instead of near the cursor

### Miscellaneous
* **deps**: bundle `angular-calendar` as a library dependency (not a peer dependency), added to `allowedNonPeerDependencies` in `ng-package.json`
* **o-calendar**: font sizes now follow the app's Material typography scale (`--mat-sys-label-small/medium/large-size`, `--mat-sys-title-medium-size`) instead of hard-coded `rem` values, so they stay consistent with the configured density/typography instead of a fixed size

## 18.0.0-next.0 (2026-04-29)

### Features
* **migration**: migrate to Angular 18 — standalone components, control flow syntax (`@if`/`@for`/`@switch`), flex-layout removal
* **theming**: adopt Material 3 tokens from `ontimize-web-ngx` 18 — `--o-*` CSS custom properties for colors, backgrounds, typography

### Bug Fixes
* **o-image-editor**: fix `tools-toggle` flex direction — `mat-button-toggle-group` column layout overrides Material specificity
* **o-image-editor**: remove border-radius from `tools-toggle` group
* **o-image-editor**: hide `mat-pseudo-checkbox` inside `tools-toggle`
* **o-image-editor**: anchor `ngx-ic-overlay` to `image-cropper` via `position: relative` to prevent overlay offset
* **o-data-view**: migrate `*ngIf`/`*ngFor` to Angular 17+ control flow syntax
* **app-test**: apply Angular 18 migration guide — Material Symbols Outlined, `.o-dark` dark theme mixin, remove duplicate `OntimizeWebModule` import

### Miscellaneous
* **deps**: align devDependencies with framework — `@angular-eslint` 18.4.3, `@typescript-eslint` ^7, `eslint` ^8.56, `jasmine-core` ~5.1, `ts-node` ~10.9, `@types/node` ^18
* **deps**: bump `ngx-extended-pdf-viewer` to `^20.0.0` for Angular 18 support
