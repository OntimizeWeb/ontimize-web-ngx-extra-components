import { NgModule } from '@angular/core';
import { OCalendarComponent } from './o-calendar.component';
import { OCalendarEventTemplateDirective, OCalendarTooltipTemplateDirective } from './o-calendar-templates.directive';

@NgModule({
  imports: [OCalendarComponent, OCalendarEventTemplateDirective, OCalendarTooltipTemplateDirective],
  exports: [OCalendarComponent, OCalendarEventTemplateDirective, OCalendarTooltipTemplateDirective]
})
export class OCalendarModule { }
