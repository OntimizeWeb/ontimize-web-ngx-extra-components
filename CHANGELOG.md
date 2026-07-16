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
