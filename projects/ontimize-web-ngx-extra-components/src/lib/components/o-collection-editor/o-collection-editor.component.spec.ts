import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { APP_CONFIG, AppConfig, appConfigFactory, DialogService, O_FORM_CONTEXT, OTranslateService } from 'ontimize-web-ngx';

import { OCollectionEditorComponent } from './o-collection-editor.component';
import { OCollectionGroupFieldsDirective, OCollectionItemDirective } from '../../directives';

interface DemoItem { id?: string; text: string; }
interface DemoGroup { id?: string; name: string; items: DemoItem[]; }

/**
 * The DI surface is small precisely because the component extends
 * `OFormDataComponent` (ctor `(elRef, injector)`) and not a service component:
 * only AppConfig (for OTranslateService/PermissionsService) and MatDialog (for
 * DialogService) are actually needed. `ActivatedRoute` is also required — every
 * `o-button` the template renders (add/remove/move/drag) injects it directly.
 */
function configureModule(extraProviders: any[] = []): void {
  TestBed.configureTestingModule({
    imports: [
      OCollectionEditorComponent,
      NoopAnimationsModule,
      HttpClientTestingModule,
      TranslateModule.forRoot(),
      MatDialogModule
    ],
    providers: [
      { provide: APP_CONFIG, useValue: { uuid: 'com.ontimize.collection-editor.test', title: 'Test', locale: 'en' } },
      { provide: AppConfig, useFactory: appConfigFactory, deps: [Injector] },
      {
        provide: ActivatedRoute,
        useValue: { params: of({}), queryParams: of({}), snapshot: { params: {}, queryParams: {}, data: {} } }
      },
      ...extraProviders
    ]
  });
}

function group(name: string, items: string[] = [], id?: string): DemoGroup {
  return { id, name, items: items.map(text => ({ text })) };
}

/** Host wrapping the editor with real projected templates, to test the fallback/template interaction. */
@Component({
  standalone: true,
  imports: [OCollectionEditorComponent, OCollectionGroupFieldsDirective, OCollectionItemDirective],
  template: `
    <o-collection-editor group-keys="id" item-keys="id" group-title-column="name" group-label="Section" item-label="Item" [static-data]="data">
      @if (withGroupTemplate) {
        <ng-template oCollectionGroupFields>
          <span class="stub-group-field">stub</span>
        </ng-template>
      }
      @if (withItemTemplate) {
        <ng-template oCollectionItem>
          <span class="stub-item-field">stub</span>
        </ng-template>
      }
    </o-collection-editor>
  `
})
class GroupItemLabelFallbackHostComponent {
  // Empty name: group-title-column="name" resolves to falsy, so group-label's fallback
  // is what renders by default. Individual tests override this to check the priority.
  data: DemoGroup[] = [group('', ['i1'])];
  withGroupTemplate = false;
  withItemTemplate = false;
}

describe('OCollectionEditorComponent', () => {
  let fixture: ComponentFixture<OCollectionEditorComponent<DemoGroup, DemoItem>>;
  let component: OCollectionEditorComponent<DemoGroup, DemoItem>;

  beforeEach(async () => {
    configureModule();
    await TestBed.compileComponents();
    fixture = TestBed.createComponent<OCollectionEditorComponent<DemoGroup, DemoItem>>(OCollectionEditorComponent);
    component = fixture.componentInstance;
    component.createGroup = (index: number) => group(`G${index}`);
    component.createItem = () => ({ text: '' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('strips the native "title" attribute after view init, so a `title` input never triggers a browser tooltip', () => {
    component.title = 'MY_APP.SECTIONS';
    fixture.nativeElement.setAttribute('title', component.title);
    fixture.detectChanges();

    expect(fixture.nativeElement.hasAttribute('title')).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  describe('CVA / value plumbing', () => {

    it('writeValue(null) and writeValue([]) both give an empty collection', () => {
      component.writeValue([group('a')]);
      expect(component.groups.length).toBe(1);

      component.writeValue(null);
      expect(component.groups.length).toBe(0);

      component.writeValue([group('a')]);
      component.writeValue([]);
      expect(component.groups.length).toBe(0);
    });

    it('getValue() always returns an array, even if a non-array was written', () => {
      component.writeValue('nonsense' as any);
      expect(component.getValue()).toEqual([]);
    });

    it('propagates through the CVA callback on every local mutation', () => {
      const onChange = jasmine.createSpy('cvaOnChange');
      component.registerOnChange(onChange);
      component.ngOnInit();

      component.addGroup();
      expect(onChange).toHaveBeenCalled();
      const emitted = onChange.calls.mostRecent().args[0];
      expect(Array.isArray(emitted)).toBe(true);
      expect(emitted.length).toBe(1);
    });

    it('the auto-echo guard keeps busy/invalid when the emitted value comes back', () => {
      component.ngOnInit();
      component.addGroup();
      const key = component.groups[0].key;
      component.setGroupBusy(key, true);
      expect(component.groups[0].busy).toBe(true);

      // exactly the array the component just emitted
      const echoed = (component as any).lastEmitted;
      component.writeValue(echoed);

      expect(component.groups[0].busy).toBe(true);
      expect(component.groups[0].key).toBe(key);
    });

    it('a genuinely new value does rebuild (and clears the previous refs)', () => {
      component.ngOnInit();
      component.addGroup();
      component.writeValue([group('other')]);
      expect(component.groups.length).toBe(1);
      expect(component.groups[0].value.name).toBe('other');
    });
  });

  /* ------------------------------------------------------------------ */
  /*
    Inside an <o-form> there is no Angular form directive on the element, so
    writeValue() is never called: the form pushes its query result with
    `comp.data = ...` (-> setData) and clears it the same way. These cover that
    path, which is the component's PRIMARY one and the one a CVA-only
    implementation silently gets wrong (rows stay empty on every loaded record).
  */
  describe('<o-form> value path (setData, no writeValue)', () => {

    it('setData builds the rows, exactly like writeValue does', () => {
      component.ngOnInit();
      component.setData([group('a', ['i1', 'i2']), group('b')]);

      expect(component.groups.length).toBe(2);
      expect(component.groups[0].items.length).toBe(2);
      expect(component.groups[0].value.name).toBe('a');
    });

    it('setData accepts the OFormValue wrapper the form actually sends', () => {
      component.ngOnInit();
      component.setData({ value: [group('a')] } as any);

      expect(component.groups.length).toBe(1);
      expect(component.groups[0].value.name).toBe('a');
    });

    it('a value set before ngOnInit (no FormControl yet) is picked up on init', () => {
      component.setData([group('a')]);
      component.ngOnInit();

      expect(component.groups.length).toBe(1);
    });

    it('clearValue empties the rows (o-form resets its components this way)', () => {
      component.ngOnInit();
      component.setData([group('a')]);
      expect(component.groups.length).toBe(1);

      component.clearValue();
      expect(component.groups.length).toBe(0);
    });

    it('setValue — oForm.setFieldValue(attr, ...) — rebuilds too', () => {
      component.ngOnInit();
      component.setValue([group('a'), group('b')]);

      expect(component.groups.map(g => g.value.name)).toEqual(['a', 'b']);
    });

    it('a local mutation does not rebuild through its own control echo', () => {
      component.ngOnInit();
      component.setData([group('a')]);
      const key = component.groups[0].key;
      component.setGroupBusy(key, true);

      component.addItem(component.groups[0]);        // emitValue -> control -> onFormControlChange

      expect(component.groups[0].key).toBe(key);     // no identity churn
      expect(component.groups[0].busy).toBe(true);   // busy survived
      expect(component.groups[0].items.length).toBe(1);
    });
  });

  /* ------------------------------------------------------------------ */
  describe('static-data', () => {

    it('seeds the collection when the form has no value', () => {
      component.staticData = [group('a'), group('b')];
      component.ngOnInit();
      expect(component.groups.length).toBe(2);
    });

    it('does not overwrite an existing form value', () => {
      component.writeValue([group('fromForm')]);
      component.staticData = [group('a'), group('b')];
      component.ngOnInit();
      expect(component.groups.length).toBe(1);
      expect(component.groups[0].value.name).toBe('fromForm');
    });
  });

  /* ------------------------------------------------------------------ */
  describe('identity', () => {

    it('derives a real key from group-keys when the fields are present', () => {
      component.groupKeys = 'id';
      component.ngOnInit();
      component.writeValue([group('a', [], '7')]);
      expect(component.groups[0].key).toContain('7');
      expect(component.groups[0].key.startsWith('oce:')).toBe(false);
    });

    it('falls back to a synthetic key when the key fields are missing', () => {
      component.groupKeys = 'id';
      component.ngOnInit();
      component.writeValue([group('a')]);          // no id
      expect(component.groups[0].key.startsWith('oce:')).toBe(true);
    });

    it('SURVIVES the toPlainValue -> writeValue round-trip (this is what rules out a WeakMap)', () => {
      component.groupKeys = 'id';
      component.ngOnInit();
      component.addGroup();
      const keyBefore = component.groups[0].key;

      // toPlainValue clones the group ({...group.value}), so the object
      // reference changes; the key must not.
      const plain = (component as any).toPlainValue();
      expect(plain[0]).not.toBe(component.groups[0].value);

      (component as any).lastEmitted = null;       // force a real rebuild
      component.writeValue(plain);

      expect(component.groups[0].key).toBe(keyBefore);
    });

    it('the synthetic key never leaks into the emitted value', () => {
      component.ngOnInit();
      component.addGroup();
      const plain = (component as any).toPlainValue();
      expect(Object.keys(plain[0])).not.toContain('oce');
      expect(JSON.stringify(plain[0])).not.toContain('oce:');
    });

    it('the key is a concatenable string (a symbol would throw here)', () => {
      component.ngOnInit();
      component.addGroup();
      expect(() => 'groupName_' + component.groups[0].key).not.toThrow();
      expect(typeof component.groups[0].key).toBe('string');
    });

    it('duplicate resolved keys warn and fall back, instead of breaking @for (NG0955)', () => {
      const warn = spyOn(console, 'warn');
      component.groupKeys = 'id';
      component.ngOnInit();
      component.writeValue([group('a', [], '1'), group('b', [], '1')]);

      expect(warn).toHaveBeenCalled();
      expect(component.groups[0].key).not.toBe(component.groups[1].key);
    });

    it('re-resolves identity when the keys arrive after the value', () => {
      component.ngOnInit();
      component.writeValue([group('a', [], '7')]);
      expect(component.groups[0].key.startsWith('oce:')).toBe(true);

      component.groupKeys = 'id';
      component.ngOnChanges({ groupKeys: { currentValue: 'id', previousValue: undefined, firstChange: false, isFirstChange: () => false } });

      expect(component.groups[0].key.startsWith('oce:')).toBe(false);
      expect(component.groups[0].key).toContain('7');
    });
  });

  /* ------------------------------------------------------------------ */
  /*
    One name serves both directions, so the pair of accessors that could be
    half-configured — or configured with the two halves on different properties,
    which silently lost every item edit — is unrepresentable.
  */
  describe('group-items-column', () => {

    it('reads and writes the items under the configured column', () => {
      component.groupItemsColumn = 'questions';
      component.createItem = () => ({ text: 'new' } as any);
      component.ngOnInit();
      component.writeValue([{ name: 'a', questions: [{ text: 'q1' }] } as any]);

      expect(component.groups[0].items.length).toBe(1);

      component.addItem(component.groups[0]);
      const plain: any[] = component.getValue();
      expect(plain[0].questions.length).toBe(2);
      expect(plain[0].items).toBeUndefined();
    });

    it('defaults to `items`, so the common shape needs no configuration', () => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1', 'i2'])]);
      expect(component.groups[0].items.length).toBe(2);
    });

    it('treats a missing column as an empty collection and warns once on a non-array', () => {
      const warn = spyOn(console, 'warn');
      component.groupItemsColumn = 'questions';
      component.ngOnInit();
      component.writeValue([{ name: 'a' } as any, { name: 'b', questions: 'nope' } as any]);

      expect(component.groups[0].items.length).toBe(0);
      expect(component.groups[1].items.length).toBe(0);
      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /*
    The group object must always carry its own items. Before, they were folded in
    only when the value was emitted, so every G handed to a callback carried the
    array from whenever the row was wrapped — silently out of date.
  */
  describe('a group always holds its current items', () => {

    beforeEach(() => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1', 'i2'])]);
    });

    it('after adding an item', () => {
      component.addItem(component.groups[0]);
      expect(component.groups[0].value.items.length).toBe(3);
    });

    it('after removing an item', async () => {
      spyOn(TestBed.inject(DialogService), 'confirm').and.returnValue(Promise.resolve(true));
      await component.removeItem(component.groups[0], component.groups[0].items[0]);
      expect(component.groups[0].value.items.length).toBe(1);
    });

    it('after reordering items', () => {
      component.moveItem(component.groups[0], 0, 1);
      expect(component.groups[0].value.items.map((i: DemoItem) => i.text)).toEqual(['i2', 'i1']);
    });

    it('so a removal handler can trust the group it is handed', async () => {
      spyOn(TestBed.inject(DialogService), 'confirm').and.returnValue(Promise.resolve(true));
      component.addItem(component.groups[0]);

      let seen = -1;
      component.removeItemHandler = (g: DemoGroup) => { seen = g.items.length; return true; };
      await component.removeItem(component.groups[0], component.groups[0].items[0]);

      expect(seen).toBe(3);          // the three on screen, not the two that arrived
    });
  });

  /* ------------------------------------------------------------------ */
  /*
    `setValue(..., setDirty = true)` marks the form dirty unconditionally, and
    `toPlainValue()` returns a new array every call, so the base class's own
    short-circuit can never fire. Without a value comparison, tabbing through a
    row dirties a form nobody edited.
  */
  describe('emitValue does not dirty a form that did not change', () => {

    it('a focusout that changed nothing emits nothing', () => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1'])]);
      const onChange = jasmine.createSpy('cvaOnChange');
      component.registerOnChange(onChange);

      component.onGroupValueChanged(component.groups[0]);
      component.onItemValueChanged(component.groups[0], component.groups[0].items[0]);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('a focusout after a real edit does emit', () => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1'])]);
      const onChange = jasmine.createSpy('cvaOnChange');
      component.registerOnChange(onChange);

      component.groups[0].value.name = 'edited';      // what a projected [(ngModel)] does
      component.onGroupValueChanged(component.groups[0]);

      expect(onChange).toHaveBeenCalled();
    });

    it('structural changes always emit, without consulting the signature', () => {
      component.ngOnInit();
      component.writeValue([group('a')]);
      const onChange = jasmine.createSpy('cvaOnChange');
      component.registerOnChange(onChange);

      component.addGroup();
      expect(onChange).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('attrFor', () => {

    it('mints a DOM-safe, stable, per-row name that never contains the raw key', () => {
      component.groupKeys = 'id';
      (component as any).oattr = 'sections';
      component.ngOnInit();
      component.writeValue([group('a', [], '7'), group('b', [], '8')]);

      const first = component.attrFor('name', component.groups[0].key);
      const second = component.attrFor('name', component.groups[1].key);

      expect(first).not.toBe(second);
      expect(first).not.toContain('{');
      expect(first.startsWith('sections_name_')).toBe(true);
      expect(component.attrFor('name', component.groups[0].key)).toBe(first);   // stable
    });

    it('registers the minted names with the form, so they stay out of the payload', () => {
      const ignored: string[] = [];
      const formStub = jasmine.createSpyObj('OFormComponent', [
        'registerFormComponent', 'registerFormControlComponent', 'registerSQLTypeFormComponent',
        'unregisterFormComponent', 'unregisterFormControlComponent', 'unregisterSQLTypeFormComponent',
        'isInInsertMode', 'isInUpdateMode', 'isEditableDetail'
      ]);
      formStub.ignoreFormCacheKeys = ignored;
      (component as any).form = formStub;
      component.ngOnInit();
      component.writeValue([group('a')]);

      const attr = component.attrFor('name', component.groups[0].key);
      expect(ignored).toContain(attr);

      component.ngOnDestroy();
      expect(ignored).not.toContain(attr);
    });
  });

  /* ------------------------------------------------------------------ */
  describe('add', () => {

    it('add buttons stay disabled when the factories are missing', () => {
      component.createGroup = undefined;
      component.createItem = undefined;
      component.ngOnInit();
      expect(component.canAddGroup).toBe(false);
      expect(component.canAddItem).toBe(false);
      expect(() => component.addGroup()).not.toThrow();
      expect(component.groups.length).toBe(0);
    });

    it('adds groups and items and emits the outputs', () => {
      const added = spyOn(component.onGroupAdded, 'emit');
      const itemAdded = spyOn(component.onItemAdded, 'emit');
      component.ngOnInit();

      component.addGroup();
      expect(component.groups.length).toBe(1);
      expect(added).toHaveBeenCalled();

      component.addItem(component.groups[0]);
      expect(component.groups[0].items.length).toBe(1);
      expect(itemAdded).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('remove', () => {
    let dialog: DialogService;

    beforeEach(() => {
      dialog = TestBed.inject(DialogService);
      spyOn(dialog, 'confirm').and.returnValue(Promise.resolve(true));
      component.ngOnInit();
      component.writeValue([group('a', ['i1', 'i2']), group('b')]);
    });

    it('a false can-remove-group vetoes without even asking', async () => {
      component.canRemoveGroup = () => false;
      await component.removeGroup(component.groups[0]);
      expect(dialog.confirm).not.toHaveBeenCalled();
      expect(component.groups.length).toBe(2);
    });

    it('removes immediately when no handler is configured', async () => {
      const removed = spyOn(component.onGroupRemoved, 'emit');
      await component.removeGroup(component.groups[0]);
      expect(component.groups.length).toBe(1);
      expect(removed).toHaveBeenCalled();
    });

    it('an empty confirm message skips the dialog', async () => {
      component.confirmRemoveGroupMessage = '';
      await component.removeGroup(component.groups[0]);
      expect(dialog.confirm).not.toHaveBeenCalled();
      expect(component.groups.length).toBe(1);
    });

    it('deferred handler resolving true: row is busy while pending, then removed', async () => {
      let resolve!: (v: boolean) => void;
      component.removeGroupHandler = () => new Promise<boolean>(r => { resolve = r; });

      const target = component.groups[0];
      const pending = component.removeGroup(target);
      await Promise.resolve();                 // let the confirm promise settle
      await Promise.resolve();
      expect(target.busy).toBe(true);

      resolve(true);
      await pending;
      expect(component.groups.length).toBe(1);
      expect(target.busy).toBe(false);
    });

    it('deferred handler resolving false: the row is kept and busy cleared', async () => {
      component.removeGroupHandler = () => Promise.resolve(false);
      const removed = spyOn(component.onGroupRemoved, 'emit');
      await component.removeGroup(component.groups[0]);
      expect(component.groups.length).toBe(2);
      expect(component.groups[0].busy).toBe(false);
      expect(removed).not.toHaveBeenCalled();
    });

    it('a throwing handler behaves like false and does not leave the row busy', async () => {
      spyOn(console, 'error');
      component.removeGroupHandler = () => Promise.reject(new Error('boom'));
      await component.removeGroup(component.groups[0]);
      expect(component.groups.length).toBe(2);
      expect(component.groups[0].busy).toBe(false);
    });

    it('resolves the target by key, not by the index captured before the await', async () => {
      const target = component.groups[1];             // 'b'
      let resolve!: (v: boolean) => void;
      component.removeGroupHandler = () => new Promise<boolean>(r => { resolve = r; });

      const pending = component.removeGroup(target);
      await Promise.resolve();
      await Promise.resolve();
      // the array shifts underneath while the handler is pending
      component.moveGroup(0, 1);
      resolve(true);
      await pending;

      expect(component.groups.length).toBe(1);
      expect(component.groups[0].value.name).toBe('a');   // 'b' went, not the one at index 1
    });

    it('ignores a second removal request for the same row while one is in flight', async () => {
      let resolve!: (v: boolean) => void;
      let calls = 0;
      component.removeGroupHandler = () => { calls++; return new Promise<boolean>(r => { resolve = r; }); };

      const target = component.groups[0];
      const first = component.removeGroup(target);
      await Promise.resolve();
      await Promise.resolve();
      await component.removeGroup(target);      // must be ignored
      resolve(true);
      await first;

      expect(calls).toBe(1);
    });

    it('removes items too', async () => {
      const removed = spyOn(component.onItemRemoved, 'emit');
      await component.removeItem(component.groups[0], component.groups[0].items[0]);
      expect(component.groups[0].items.length).toBe(1);
      expect(removed).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('reorder', () => {

    beforeEach(() => {
      component.ngOnInit();
      component.writeValue([group('a'), group('b'), group('c')]);
    });

    it('moves a group and emits onGroupMoved with both indexes', () => {
      const moved = spyOn(component.onGroupMoved, 'emit');
      component.moveGroup(0, 2);
      expect(component.groups.map(g => g.value.name)).toEqual(['b', 'c', 'a']);
      expect(moved).toHaveBeenCalledWith(jasmine.objectContaining({ previousIndex: 0, currentIndex: 2 }));
    });

    it('ignores an out-of-bounds move', () => {
      component.moveGroup(0, 99);
      expect(component.groups.map(g => g.value.name)).toEqual(['a', 'b', 'c']);
    });

    it('never writes an order field into the data', () => {
      component.moveGroup(0, 1);
      const plain = (component as any).toPlainValue();
      expect(Object.keys(plain[0])).toEqual(['id', 'name', 'items']);
    });

    it('announces the new position for screen readers', () => {
      component.moveGroup(0, 1);
      expect(component.moveAnnouncement).toBe('2 / 3');
    });
  });

  /* ------------------------------------------------------------------ */
  describe('validation', () => {

    it('min-groups marks invalid but never blocks removing', async () => {
      const dialog = TestBed.inject(DialogService);
      spyOn(dialog, 'confirm').and.returnValue(Promise.resolve(true));
      component.minGroups = 2;
      component.minItemsPerGroup = 0;
      component.ngOnInit();
      component.writeValue([group('a'), group('b')]);

      await component.removeGroup(component.groups[0]);

      expect(component.groups.length).toBe(1);                    // removal happened
      expect(component.getControl().hasError('minGroups')).toBe(true);
    });

    it('surfaces the errors on the control, so a native FormGroup turns invalid', () => {
      component.minGroups = 1;
      component.minItemsPerGroup = 0;
      component.ngOnInit();
      component.writeValue([]);

      const errors = component.validate(new FormControl(null) as AbstractControl);
      expect(errors).toBeTruthy();
      expect(errors!['minGroups']).toEqual({ required: 1, actual: 0 });

      const fg = new FormGroup({ groups: new FormControl(null, () => component.validate(new FormControl(null) as AbstractControl)) });
      fg.get('groups')!.updateValueAndValidity();
      expect(fg.valid).toBe(false);
    });

    it('validateStructure returns an OFormValidation with resolved messages', () => {
      // ngx-translate only resolves a key once a current/default lang is set; a real
      // app does this through its APP_INITIALIZER, which this bare TestBed never runs.
      TestBed.inject(OTranslateService).setDefaultLang('en');
      component.minGroups = 1;
      component.minItemsPerGroup = 0;
      component.ngOnInit();
      component.writeValue([]);

      const result = component.validateStructure();
      expect(result.valid).toBe(false);
      expect(result.messages && result.messages.length).toBeGreaterThan(0);
      // resolved text, not a raw i18n key: o-form puts these straight into an alert
      expect(result.messages!.join(' ')).not.toContain('COLLECTION_EDITOR.');
    });

    it('flags only the groups below min-items-per-group, and clears them again', () => {
      component.minItemsPerGroup = 1;
      component.ngOnInit();
      component.writeValue([group('a'), group('b', ['i1'])]);       // 'a' has no items, 'b' has one

      component.validateStructure();
      expect(component.groups[0].invalid).toBe(true);
      expect(component.groups[1].invalid).toBe(false);

      component.addItem(component.groups[0]);                      // now meets the minimum
      expect(component.groups[0].invalid).toBe(false);              // recomputed by emitValue(), no validateStructure() needed
    });

    it('does NOT validate individual fields (required, etc.) — that is the projected input\'s own job', () => {
      // No group-validator/item-validator exists on this component: a group or
      // item with blank data is not itself a validation error here. Field-level
      // validation belongs to the projected `o-text-input` (its own `required`),
      // which registers with the surrounding <o-form> independently (§9).
      component.minGroups = 0;
      component.minItemsPerGroup = 0;
      component.ngOnInit();
      component.writeValue([group('')]);   // blank name — not flagged by this component

      const errors = component.validate(new FormControl(null) as AbstractControl);
      expect(errors).toBeNull();
      expect(component.groups[0].invalid).toBe(false);
    });

    it('reports OTHER as SQL type so a G[] never reaches the form sqlTypes', () => {
      expect(component.getSQLType()).toBe(component.getSQLType());
      expect(typeof component.getSQLType()).toBe('number');
    });
  });

  /* ------------------------------------------------------------------ */
  describe('busy', () => {

    beforeEach(() => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1'])]);
    });

    it('setGroupBusy / setItemBusy toggle the flags', () => {
      const gKey = component.groups[0].key;
      const iKey = component.groups[0].items[0].key;

      component.setGroupBusy(gKey, true);
      expect(component.groups[0].busy).toBe(true);

      component.setItemBusy(gKey, iKey, true);
      expect(component.groups[0].items[0].busy).toBe(true);
    });

    it('warns instead of throwing on a stale key', () => {
      const warn = spyOn(console, 'warn');
      expect(() => component.setGroupBusy('oce:does-not-exist', true)).not.toThrow();
      expect(warn).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('template contexts', () => {

    it('the group context carries every documented entry', () => {
      component.ngOnInit();
      component.writeValue([group('a')]);
      const ctx = component.groupContext(component.groups[0], 0);
      ['$implicit', 'group', 'key', 'index', 'busy', 'invalid', 'disabled', 'notifyChange']
        .forEach(k => expect(k in ctx).toBe(true, `missing "${k}" in the group context`));
    });

    it('the item context carries groupKey, so setItemBusy is reachable', () => {
      component.ngOnInit();
      component.writeValue([group('a', ['i1'])]);
      const g = component.groups[0];
      const ctx = component.itemContext(g, g.items[0], 0, 0);
      // No 'invalid' here on purpose: there is nothing structural to evaluate at the item level (see the class docs).
      ['$implicit', 'item', 'group', 'groupKey', 'key', 'groupIndex', 'itemIndex', 'busy', 'disabled', 'notifyChange']
        .forEach(k => expect(k in ctx).toBe(true, `missing "${k}" in the item context`));
      expect(ctx.groupKey).toBe(g.key);
    });

    it('notifyChange from the context re-emits the value', () => {
      const onChange = jasmine.createSpy('cvaOnChange');
      component.registerOnChange(onChange);
      component.ngOnInit();
      component.writeValue([group('a')]);
      onChange.calls.reset();

      // Same as any other focusout: an untouched group is a no-op emit (see
      // "emitValue does not dirty a form that did not change" below), so the
      // context's notifyChange is only observable here after a real edit.
      component.groups[0].value.name = 'edited';
      component.groupContext(component.groups[0], 0).notifyChange();
      expect(onChange).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('o-form integration', () => {

    it('registers itself when an O_FORM_CONTEXT is present', async () => {
      const formStub = jasmine.createSpyObj('OFormComponent', [
        'registerFormComponent', 'registerFormControlComponent', 'registerSQLTypeFormComponent',
        'unregisterFormComponent', 'unregisterFormControlComponent', 'unregisterSQLTypeFormComponent',
        'isInInsertMode', 'isInUpdateMode', 'isEditableDetail'
      ]);
      formStub.isInInsertMode.and.returnValue(true);
      formStub.isInUpdateMode.and.returnValue(false);
      formStub.isEditableDetail.and.returnValue(false);

      TestBed.resetTestingModule();
      configureModule([{ provide: O_FORM_CONTEXT, useValue: formStub }]);
      await TestBed.compileComponents();
      const f = TestBed.createComponent<OCollectionEditorComponent<DemoGroup, DemoItem>>(OCollectionEditorComponent);
      const c = f.componentInstance;
      // `oattr` is protected in OBaseComponent; in real usage it arrives as the
      // `attr` input, which bypasses the TS visibility check.
      (c as any).oattr = 'sections';
      c.ngOnInit();

      expect(formStub.registerFormComponent).toHaveBeenCalledWith(c);
      expect(formStub.registerFormControlComponent).toHaveBeenCalledWith(c);
    });
  });

  /* ------------------------------------------------------------------ */
  describe('rendering (smoke test)', () => {

    it('renders the chrome for static data without throwing', () => {
      component.groupLabel = 'Section';
      component.itemsLabel = 'Items';
      component.staticData = [group('a', ['i1'])];
      component.ngOnInit();

      expect(() => fixture.detectChanges()).not.toThrow();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelectorAll('.o-collection-editor__group').length).toBe(1);
      expect(el.querySelectorAll('.o-collection-editor__item').length).toBe(1);
      // every actionable control must be a real button with an explicit type,
      // otherwise it would submit the surrounding <form> inside an <o-form>
      const buttons = Array.from(el.querySelectorAll('button'));
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(b => expect(b.getAttribute('type')).toBe('button'));
    });
  });

  /* ------------------------------------------------------------------ */
  describe('action styles', () => {

    it('defaults every action to its historic shape when nothing is configured', () => {
      expect(component.getResolvedActionStyle('add-group').variant).toBe('outline');
      expect(component.getResolvedActionStyle('add-item').variant).toBe('basic');
      ['remove-group', 'remove-item', 'move-group-up', 'move-group-down',
        'move-item-up', 'move-item-down', 'drag-group', 'drag-item'].forEach(attr =>
        expect(component.getResolvedActionStyle(attr).variant).toBe('icon', `unexpected variant for "${attr}"`));
    });

    it('does NOT auto-highlight add-group/add-item as primary (unlike o-table/o-list/...)', () => {
      expect(component.getResolvedActionStyle('add-group').importance).toBe('default');
      expect(component.getResolvedActionStyle('add-item').importance).toBe('default');
    });

    it('an explicit action-styles entry overrides the default for that attr only', () => {
      component.actionStyles = { 'add-group': { variant: 'flat', importance: 'primary' } };
      expect(component.getResolvedActionStyle('add-group')).toEqual({ variant: 'flat', importance: 'primary', label: undefined });
      // untouched attrs keep their own default
      expect(component.getResolvedActionStyle('add-item').variant).toBe('basic');
    });

    it('accepts action-styles as a JSON string, parsed on ngOnInit', () => {
      component.actionStyles = '{"remove-item":{"importance":"warn"}}' as any;
      component.ngOnInit();
      expect(component.getResolvedActionStyle('remove-item').importance).toBe('warn');
    });

    it('an unparsable action-styles string is dropped instead of throwing', () => {
      component.actionStyles = 'not json' as any;
      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.actionStyles).toBeUndefined();
    });

    it('the rendered buttons carry the attr action-styles resolves by', () => {
      component.staticData = [group('a', ['i1'])];
      component.ngOnInit();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      ['add-group', 'add-item', 'remove-group', 'remove-item',
        'move-group-up', 'move-group-down', 'move-item-up', 'move-item-down',
        'drag-group', 'drag-item'].forEach(attr =>
        expect(el.querySelector(`o-button[attr="${attr}"]`)).withContext(attr).not.toBeNull());
    });
  });

  /* ------------------------------------------------------------------ */
  describe('data-testid', () => {

    it('renders no data-testid on its own elements when the input is left unset', () => {
      component.staticData = [group('a', ['i1'])];
      component.ngOnInit();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      // Scoped to the elements THIS component controls: `o-button`'s own inner <button>
      // always carries a data-testid equal to its own `attr` (see OButtonComponent's
      // `dataTestId` getter), independently of this component's own input.
      expect(el.querySelectorAll('o-button[data-testid]').length).toBe(0);
      expect(el.querySelectorAll('.o-collection-editor__group[data-testid]').length).toBe(0);
      expect(el.querySelectorAll('.o-collection-editor__item[data-testid]').length).toBe(0);
    });

    it('composes static and per-row test ids from the data-testid input', () => {
      (component as any).oattr = 'sections';
      component.staticData = [group('a', ['i1'])];
      component.ngOnInit();
      fixture.detectChanges();

      // dataTestId falls back to attr when data-testid isn't set explicitly (OFormDataComponent).
      expect(component.dataTestId).toBe('sections');
      expect(component.getDataTestId('add-group')).toBe('sections-add-group');

      const groupKey = component.groups[0].key;
      const itemKey = component.groups[0].items[0].key;
      expect(component.getRowDataTestId('remove-group', groupKey)).toBe(`sections-remove-group-${component.rowToken(groupKey)}`);
      expect(component.getRowDataTestId('remove-item', itemKey)).toBe(`sections-remove-item-${component.rowToken(itemKey)}`);

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector(`[data-testid="${component.getDataTestId('add-group')}"]`)).not.toBeNull();
      expect(el.querySelector(`[data-testid="${component.getRowDataTestId('group', groupKey)}"]`)).not.toBeNull();
      expect(el.querySelector(`[data-testid="${component.getRowDataTestId('remove-item', itemKey)}"]`)).not.toBeNull();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('group-label / item-label fallback', () => {
    let hostFixture: ComponentFixture<GroupItemLabelFallbackHostComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          GroupItemLabelFallbackHostComponent,
          NoopAnimationsModule,
          HttpClientTestingModule,
          TranslateModule.forRoot(),
          MatDialogModule
        ],
        providers: [
          { provide: APP_CONFIG, useValue: { uuid: 'com.ontimize.collection-editor.test', title: 'Test', locale: 'en' } },
          { provide: AppConfig, useFactory: appConfigFactory, deps: [Injector] },
          {
            provide: ActivatedRoute,
            useValue: { params: of({}), queryParams: of({}), snapshot: { params: {}, queryParams: {}, data: {} } }
          }
        ]
      });
      await TestBed.compileComponents();
      hostFixture = TestBed.createComponent(GroupItemLabelFallbackHostComponent);
    });

    it('shows the fallback translated, with no row number appended', () => {
      hostFixture.detectChanges();
      const el: HTMLElement = hostFixture.nativeElement;
      // 'Section'/'Item' pass through oTranslate unresolved as literal text (no matching
      // i18n key), so this also confirms there is no "... 1" suffix glued onto them.
      expect(el.querySelector('.o-collection-editor__group-name')?.textContent?.trim()).toBe('Section');
      expect(el.querySelector('.o-collection-editor__item-name')?.textContent?.trim()).toBe('Item');
    });

    it('keeps showing the fallback next to a projected template — the two are independent, not exclusive', () => {
      hostFixture.componentInstance.withGroupTemplate = true;
      hostFixture.componentInstance.withItemTemplate = true;
      hostFixture.detectChanges();
      const el: HTMLElement = hostFixture.nativeElement;
      expect(el.querySelector('.o-collection-editor__group-name')?.textContent?.trim()).toBe('Section');
      expect(el.querySelector('.stub-group-field')).not.toBeNull();
      expect(el.querySelector('.o-collection-editor__item-name')?.textContent?.trim()).toBe('Item');
      expect(el.querySelector('.stub-item-field')).not.toBeNull();
    });

    it('a group-title-column value still takes priority over the group-label fallback', () => {
      hostFixture.componentInstance.data = [{ id: 'a', name: 'Kickoff', items: [{ id: 'i1', text: '' }] }];
      hostFixture.detectChanges();
      const el: HTMLElement = hostFixture.nativeElement;
      expect(el.querySelector('.o-collection-editor__group-name')?.textContent?.trim()).toBe('Kickoff');
    });
  });
});
