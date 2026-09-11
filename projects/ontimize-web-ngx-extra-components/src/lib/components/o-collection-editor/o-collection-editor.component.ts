import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  BooleanInputConverter,
  DialogService,
  NumberInputConverter,
  O_ACTION_STYLES_CONFIG,
  OActionStyle,
  OActionStyleProvider,
  OActionStylesConfig,
  OButtonComponent,
  OFormDataComponent,
  OFormValidation,
  OResolvedActionStyle,
  OTranslatePipe,
  OTranslateService,
  OValueChangeEvent,
  resolveActionStyle,
  ServiceUtils,
  SQLTypes,
  Util
} from 'ontimize-web-ngx';

import { TranslateExtraComponentsService } from '../../services';
import {
  OCollectionCanRemoveGroup,
  OCollectionCanRemoveItem,
  OCollectionCreateGroup,
  OCollectionCreateItem,
  OCollectionGroupEvent,
  OCollectionGroupMovedEvent,
  OCollectionItemEvent,
  OCollectionItemMovedEvent,
  OCollectionKey,
  OCollectionRemoveGroupHandler,
  OCollectionRemoveItemHandler
} from '../../types/collection-editor.types';
import {
  OCollectionGroupFieldsDirective,
  OCollectionItemDirective
} from '../../directives';

/* -------------------------------------------------------------------------- */
/* Internal model — never exposed as the form value                          */
/* -------------------------------------------------------------------------- */

interface OCollectionItemRef<I> {
  key: OCollectionKey;
  value: I;
  busy: boolean;
}

interface OCollectionGroupRef<G, I> {
  key: OCollectionKey;
  value: G;
  items: OCollectionItemRef<I>[];
  busy: boolean;
  invalid: boolean;
}

const O_COLLECTION_KEY = Symbol('oCollectionKey');

/** Prefix reserved for synthetic keys, so they can never collide with a real (serialized) one. */
const SYNTHETIC_KEY_PREFIX = 'oce:';

@Component({
  selector: 'o-collection-editor',
  templateUrl: './o-collection-editor.component.html',
  styleUrls: ['./o-collection-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatTooltipModule,
    NgxSkeletonLoaderModule,
    OButtonComponent,
    OTranslatePipe
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    // Re-declared pointing at this class: provider metadata is not inherited
    // from the base @Directive, which is why every Ontimize input does the same.
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OCollectionEditorComponent), multi: true },
    // Makes the native `formControlName` / `ngModel` path see our errors. Inert
    // inside <o-form>, where there is no Angular form directive on the element.
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => OCollectionEditorComponent), multi: true },
    // Same DI hookup `o-table` / `o-list` / `o-tree` / `o-form` use: every `o-button`
    // in this component's own template (they all share this element injector) resolves
    // its style from `action-styles` by its own `attr`, with no wiring per button.
    { provide: OActionStyleProvider, useExisting: forwardRef(() => OCollectionEditorComponent) }
  ]
})
export class OCollectionEditorComponent<G = any, I = any>
  extends OFormDataComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges, Validator {

  /** Matches the component's own selector, the convention every ontimize-web-ngx component follows. */
  @HostBinding('class.o-collection-editor') readonly hostClass = true;

  /* -------------------- IDENTITY -------------------- */

  @Input('group-keys') groupKeys?: string;
  @Input('item-keys') itemKeys?: string;

  /* -------------------- DATA SHAPE BRIDGE -------------------- */

  /**
   * Property on a group that holds its items, e.g. `group-items-column="questions"`
   * for `{ id, name, questions: [...] }`.
   */
  @Input('group-items-column') groupItemsColumn: string = 'items';

  @Input('create-group') createGroup?: OCollectionCreateGroup<G>;
  @Input('create-item') createItem?: OCollectionCreateItem<G, I>;

  /** Local seed data. The form value (CVA) always wins over this. */
  @Input('static-data') staticData?: G[];

  /* -------------------- REMOVAL -------------------- */

  @Input('can-remove-group') canRemoveGroup?: OCollectionCanRemoveGroup<G>;
  @Input('can-remove-item') canRemoveItem?: OCollectionCanRemoveItem<G, I>;
  @Input('remove-group-handler') removeGroupHandler?: OCollectionRemoveGroupHandler<G>;
  @Input('remove-item-handler') removeItemHandler?: OCollectionRemoveItemHandler<G, I>;

  @Input('confirm-remove-group-title') confirmRemoveGroupTitle: string = 'CONFIRM';
  @Input('confirm-remove-group-message') confirmRemoveGroupMessage: string = 'MESSAGES.CONFIRM_DELETE';
  @Input('confirm-remove-item-title') confirmRemoveItemTitle: string = 'CONFIRM';
  @Input('confirm-remove-item-message') confirmRemoveItemMessage: string = 'MESSAGES.CONFIRM_DELETE';

  /**
   * Structural validation only: `min-groups` / `min-items-per-group`, about
   * the SHAPE of the collection, not any single field's own content.
   * Per-row field validation (required, max-length, maxDate...) is NOT this
   * component's job — the projected `o-text-input`/`o-date-input`/etc. already
   * has that built in.
   */

  @Input('min-groups')
  @NumberInputConverter()
  minGroups: number = 1;

  @Input('min-items-per-group')
  @NumberInputConverter()
  minItemsPerGroup: number = 1;

  /* -------------------- DRAG & DROP -------------------- */

  @Input('groups-draggable')
  @BooleanInputConverter()
  groupsDraggable: boolean = true;

  @Input('items-draggable')
  @BooleanInputConverter()
  itemsDraggable: boolean = true;

  /**
   * Independent of `groups-draggable`/`items-draggable` (mouse drag only):
   * gates the keyboard up/down reorder buttons, so a consumer can offer one
   * mechanism without the other (e.g. keyboard-only reordering with drag off).
   */
  @Input('groups-sortable')
  @BooleanInputConverter()
  groupsSortable: boolean = true;

  @Input('items-sortable')
  @BooleanInputConverter()
  itemsSortable: boolean = true;

  /* -------------------- CAPABILITY TOGGLES -------------------- */
  // Blanket feature switches, independent from the per-row `can-remove-*`
  // predicates: those veto ONE row, these disable the capability entirely
  // (hide the button) regardless of `create-group`/`create-item` being set.

  @Input('groups-addable')
  @BooleanInputConverter()
  groupsAddable: boolean = true;

  @Input('items-addable')
  @BooleanInputConverter()
  itemsAddable: boolean = true;

  @Input('groups-removable')
  @BooleanInputConverter()
  groupsRemovable: boolean = true;

  @Input('items-removable')
  @BooleanInputConverter()
  itemsRemovable: boolean = true;

  /* -------------------- TEXTS -------------------- */

  @Input('title') title?: string;
  @Input('description') description?: string;

  @Input('group-label') groupLabel?: string;
  @Input('item-label') itemLabel?: string;
  @Input('items-label') itemsLabel?: string;

  @Input('add-group-text') addGroupText: string = 'COLLECTION_EDITOR.ADD_GROUP';
  @Input('add-item-text') addItemText: string = 'COLLECTION_EDITOR.ADD_ITEM';

  @Input('remove-group-tooltip') removeGroupTooltip: string = 'COLLECTION_EDITOR.REMOVE_GROUP';
  @Input('remove-item-tooltip') removeItemTooltip: string = 'COLLECTION_EDITOR.REMOVE_ITEM';

  @Input('drag-group-tooltip') dragGroupTooltip: string = 'COLLECTION_EDITOR.DRAG_GROUP';
  @Input('drag-item-tooltip') dragItemTooltip: string = 'COLLECTION_EDITOR.DRAG_ITEM';

  @Input('empty-groups-text') emptyGroupsText: string = 'COLLECTION_EDITOR.EMPTY_GROUPS';
  @Input('empty-items-text') emptyItemsText: string = 'COLLECTION_EDITOR.EMPTY_ITEMS';

  @Input('min-groups-text') minGroupsText: string = 'COLLECTION_EDITOR.VALIDATION.MIN_GROUPS';
  @Input('min-items-text') minItemsText: string = 'COLLECTION_EDITOR.VALIDATION.MIN_ITEMS_PER_GROUP';

  /* -------------------- ACTION STYLES -------------------- */

  /**
   * Per-action visual style keyed by the action `attr` (`add-group`, `add-item`,
   * `remove-group`, `remove-item`, `move-group-up`, `move-group-down`,
   * `move-item-up`, `move-item-down`, `drag-group`, `drag-item`), following the
   * same `OActionStyle` model as `o-form` / `o-table` / `o-grid` / `o-list` / `o-tree`.
   * Accepts a JSON string too (`action-styles='{"add-group":{"variant":"flat"}}'`).
   */
  @Input('action-styles') actionStyles?: Record<string, OActionStyle>;

  /** App-wide action-style defaults (from `O_ACTION_STYLES_CONFIG`), if provided. */
  protected globalActionStylesConfig?: OActionStylesConfig;

  /* -------------------- TITLES FROM DATA -------------------- */

  @Input('group-title-column') groupTitleColumn?: string;
  @Input('group-description-column') groupDescriptionColumn?: string;
  @Input('item-title-column') itemTitleColumn?: string;
  @Input('item-description-column') itemDescriptionColumn?: string;

  /* -------------------- OUTPUTS -------------------- */

  @Output() onGroupAdded = new EventEmitter<OCollectionGroupEvent<G>>();
  @Output() onGroupRemoved = new EventEmitter<OCollectionGroupEvent<G>>();
  @Output() onItemAdded = new EventEmitter<OCollectionItemEvent<G, I>>();
  @Output() onItemRemoved = new EventEmitter<OCollectionItemEvent<G, I>>();
  @Output() onGroupMoved = new EventEmitter<OCollectionGroupMovedEvent<G>>();
  @Output() onItemMoved = new EventEmitter<OCollectionItemMovedEvent<G, I>>();

  /* -------------------- PROJECTED TEMPLATES -------------------- */

  @ContentChild(OCollectionGroupFieldsDirective)
  protected groupFieldsDirective?: OCollectionGroupFieldsDirective;

  @ContentChild(OCollectionItemDirective)
  protected itemDirective?: OCollectionItemDirective;

  get groupFieldsTemplate(): TemplateRef<any> | undefined {
    return this.groupFieldsDirective?.templateRef;
  }
  get itemTemplate(): TemplateRef<any> | undefined {
    return this.itemDirective?.templateRef;
  }

  /* -------------------- INTERNAL STATE -------------------- */

  groups: OCollectionGroupRef<G, I>[] = [];

  protected dialogService: DialogService;
  protected oTranslate: OTranslateService;
  protected cd: ChangeDetectorRef;

  private groupKeysArray: string[] = [];
  private itemKeysArray: string[] = [];

  /** Counter behind the synthetic identity, mirroring the seed case's `nextUid`. */
  private nextSyntheticId = 1;

  /** Last array handed to `setValue`, used to recognise (and ignore) our own echo. */
  private lastEmitted: G[] | null = null;

  /** Last array the rows were built from, so the same value is never applied twice. */
  private lastApplied: G[] | null = null;

  /** Serialized value the outside world currently believes in — see `signatureOf`. */
  private emittedSignature: string | null = null;

  /** `group-items-column` mismatches are a config mistake: say it once, not once per row. */
  private warnedItemsColumn = false;

  /** DOM-safe token per row key, backing `attrFor` and the element ids. */
  private readonly rowTokens = new Map<OCollectionKey, string>();
  private nextRowToken = 1;

  /** Control names minted through `attrFor`, so they can be un-ignored on destroy. */
  private readonly mintedAttrs = new Set<string>();

  /** Keys with a removal in flight, so a second request for the same row is ignored. */
  private readonly removingKeys = new Set<OCollectionKey>();

  private initialized = false;

  /** Text of the polite live region: announces the outcome of a keyboard reorder. */
  moveAnnouncement = '';

  /**
   * Skeleton shapes for a busy row. `ngx-skeleton-loader` directly, not
   * `<o-skeleton>` (a fixed profile-card silhouette, unusable here).
   * `box-sizing` is handled in the scss: a percentage box with padding would
   * otherwise overflow and trigger scrollbars.
   */
  readonly skeletonFieldTheme = {
    width: '60%',
    height: '18px',
    margin: '0 0 8px',
    'border-radius': '4px',
    'background-color': 'var(--o-collection-editor-skeleton, rgba(0, 0, 0, 0.08))'
  };
  readonly skeletonRowTheme = {
    width: '100%',
    height: '14px',
    margin: '0',
    'border-radius': '3px',
    'background-color': 'var(--o-collection-editor-skeleton, rgba(0, 0, 0, 0.08))'
  };

  constructor(elRef: ElementRef, injector: Injector) {
    super(elRef, injector);
    this.dialogService = this.injector.get<DialogService>(DialogService);
    this.oTranslate = this.injector.get<OTranslateService>(OTranslateService);
    this.cd = this.injector.get<ChangeDetectorRef>(ChangeDetectorRef);
    // Registers this library's i18n MAP into ngx-translate. Without it the
    // component's own COLLECTION_EDITOR.* keys are not resolved by oTranslate.
    this.injector.get<TranslateExtraComponentsService>(TranslateExtraComponentsService);
    this.globalActionStylesConfig = this.injector.get(O_ACTION_STYLES_CONFIG, null) ?? undefined;
    // A G[] has no SQL type; keep it out of o-form's _compSQLTypes, which only
    // stores types different from OTHER.
    this._defaultSQLTypeKey = 'OTHER';
    this.defaultValue = [] as any;
  }

  /* -------------------- LIFECYCLE -------------------- */

  override ngOnInit(): void {
    this.parseKeys();
    if (typeof this.actionStyles === 'string') {
      try {
        this.actionStyles = JSON.parse(this.actionStyles);
      } catch {
        this.actionStyles = undefined;
      }
    }
    super.ngOnInit();
    // A value set before the internal FormControl existed never went through
    // onFormControlChange; pick it up now, before deciding on the seed data.
    this.applyIncomingValue();
    if (!this.hasValue() && Util.isDefined(this.staticData)) {
      this.setGroupsFromData(this.staticData as G[]);
    }
    this.initialized = true;
  }

  override ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const keysChanged = Util.isDefined(changes['groupKeys']) || Util.isDefined(changes['itemKeys']);
    if (keysChanged) {
      this.parseKeys();
      // Rows wrapped before the keys arrived hold a synthetic identity even
      // though their data carries the real key; re-resolve so real identity
      // takes over. This does change the key the consumer sees.
      this.reresolveIdentities();
    }
    super.ngOnChanges(changes);
    if (Util.isDefined(changes['staticData']?.currentValue) && this.initialized && !this.hasValue()) {
      this.setGroupsFromData(changes['staticData'].currentValue);
    }
  }

  override ngOnDestroy(): void {
    // Before super: `unregisterFormListeners()` runs in there, and this needs the
    // form reference. Leaving the names behind would grow the form's ignore list
    // for the rest of its life.
    this.releaseMintedAttrs();
    super.ngOnDestroy();
  }

  /**
   * `title` is also a native HTML global attribute: a plain `title="..."` in the
   * consumer's template lands both on the `@Input` AND on the host element, which
   * then shows it as a raw, untranslated browser tooltip over the whole component.
   * Same fix `OContainerComponent` / `OServiceComponent` use for the same input name.
   */
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.elRef.nativeElement.removeAttribute('title');
  }

  /* -------------------- ControlValueAccessor -------------------- */

  /**
   * The native `formControlName` / `ngModel` path. Kept as its own entry point
   * because it is the only one that also works before the internal
   * `FormControl` exists — once it does, `super.writeValue()` pushes the value
   * into it and `onFormControlChange()` below picks it up.
   */
  override writeValue(value: any): void {
    super.writeValue(value);
    this.applyIncomingValue();
  }

  /**
   * The `<o-form>` path, and the reason this override exists at all.
   *
   * Inside an `<o-form>` there is no Angular form directive on the element, so
   * `writeValue()` is NEVER called: the form pushes its query result straight
   * onto every registered component (`comp.data = ...` -> `setData()` ->
   * `setFormValue()`), and clears them the same way. All of those end up on the
   * internal `FormControl`, so hooking its change is what covers the whole
   * family — `setData()`, `setValue()`, `clearValue()`, `oForm.setFieldValue()`
   * and o-form's own cache/undo — in one place.
   */
  override onFormControlChange(value: any): void {
    super.onFormControlChange(value);
    this.applyIncomingValue();
  }

  /**
   * Rebuilds the rows from the value the component now holds, unless it is the
   * echo of our own `emitValue()` (rebuilding then would throw away busy/invalid,
   * churn identities and, through the control, recurse) or a value already
   * applied (`writeValue` reaches here twice: once through the control, once on
   * its way out).
   */
  private applyIncomingValue(): void {
    const value = this.getValue();
    if (value === this.lastEmitted || value === this.lastApplied) {
      return;
    }
    this.lastEmitted = null;
    this.lastApplied = value;
    this.setGroupsFromData(value);
  }

  /** Always an array, whatever arrives (null, undefined, a non-array). */
  override ensureOFormValue(arg: any): void {
    const raw = arg && arg.value !== undefined && !Util.isArray(arg) ? arg.value : arg;
    super.ensureOFormValue(Util.isArray(raw) ? raw : []);
  }

  override getValue(): G[] {
    const value = super.getValue();
    return Util.isArray(value) ? value as G[] : [];
  }

  /* -------------------- Validator (native formControlName / ngModel path) -------------------- */

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.computeErrors();
  }

  /* -------------------- VALUE PLUMBING -------------------- */

  /**
   * The single propagation path for every local mutation: rebuild the plain
   * value, push it through the FormControl, refresh validation.
   *
   * Goes through the inherited `setValue()`, not `onChange` directly, because
   * `OFormDataComponent.onChange` is only an `EventEmitter` output — the real
   * CVA callback is private. `setValue()` updates the FormControl, and it's
   * that FormControl's `valueChanges` subscription which in turn emits
   * `onChange` and calls the CVA callback.
   *
   * @param force When `false`, the emit is skipped if the value is identical
   * to the last one emitted (see `signatureOf`). Only `notifyChange()` and the
   * `focusout` safety net pass `false`: both mean "something MAY have changed",
   * and both fire on every focus exit — edited or not. Every other caller
   * mutates the collection by construction, so it keeps the default `true`.
   */
  private emitValue(force: boolean = true): void {
    const plain = this.toPlainValue();
    const signature = this.signatureOf(plain);
    if (!force && signature === this.emittedSignature) {
      return;
    }
    this.lastEmitted = plain;
    this.emittedSignature = signature;
    // The rows no longer match whatever was last applied, so that array must be
    // able to come back in (o-form's undo/cache restores the very same reference).
    this.lastApplied = null;
    this.setValue(this.lastEmitted, { changeType: OValueChangeEvent.USER_CHANGE }, true);
    this.refreshValidation();
  }

  /**
   * A string fingerprint of a value, used to tell whether `emitValue(false)`
   * actually needs to emit.
   *
   * That comparison is needed because `setValue(..., setDirty = true)` marks
   * the control dirty unconditionally, and the base class's own reference
   * check (`oldValue !== val`) can never short-circuit it: `toPlainValue()`
   * builds a brand new array on every call, so it's always a different
   * reference even when nothing changed. Without comparing by content, merely
   * tabbing through a row — with nothing edited — would dirty the surrounding
   * `<o-form>` and push this attr into the next save payload.
   *
   * `JSON.stringify` is enough for this: it drops `undefined` fields and
   * functions, but does so the same way on both sides being compared, so it
   * can never mask a real change. The synthetic identity is invisible to it
   * too, by design — it lives under a symbol-keyed property, which
   * `JSON.stringify` always skips.
   */
  private signatureOf(value: G[]): string {
    try {
      return JSON.stringify(value);
    } catch {
      // Circular data in the consumer's own objects: stop comparing and just
      // emit, by returning something that can never match a previous signature.
      return `${this.nextSyntheticId++}`;
    }
  }

  private toPlainValue(): G[] {
    // The items already live on the group value (see `syncGroupItems`), so this
    // is only the clone that keeps the emitted value from aliasing internal state.
    return this.groups.map(group => ({ ...group.value }));
  }

  /**
   * Writes the current items back onto the group object, so a group always holds
   * its own children.
   *
   * Item mutations touch only the internal ref list. Reconciling them lazily, in
   * `toPlainValue()`, meant every `G` handed to a consumer — `create-item`, the
   * `can-remove-*` predicates, the removal handlers, every output payload and
   * both template contexts — carried the items array from whenever the row was
   * wrapped. Nothing said so, nothing failed, and the collection was simply out
   * of date. Doing it here makes the invariant true by construction from the
   * three places that can break it, instead of by discipline at ten places that
   * read it.
   *
   * Mutates in place on purpose: the group template's `[(ngModel)]` writes
   * through to this object, and the synthetic identity is a property on it.
   */
  private syncGroupItems(group: OCollectionGroupRef<G, I>): void {
    const items = group.items.map(item => item.value);
    try {
      (group.value as any)[this.groupItemsColumn] = items;
    } catch {
      console.error(`[o-collection-editor] could not write "${this.groupItemsColumn}" on a group: ` +
        'the row object is frozen or the property is read-only. Item changes will not reach the value.');
    }
  }

  private hasValue(): boolean {
    return this.groups.length > 0;
  }

  private setGroupsFromData(data: G[] | null | undefined): void {
    const source = Util.isArray(data) ? data as G[] : [];
    this.groups = source.map(group => this.wrapGroup(group));
    this.dedupeKeys();
    // Incoming data is what the outside world believes right now, so the first
    // focusout on a freshly loaded record is free too.
    this.emittedSignature = this.signatureOf(this.toPlainValue());
    this.refreshValidation();
    this.cd.markForCheck();
  }

  private wrapGroup(value: G): OCollectionGroupRef<G, I> {
    const items = this.readGroupItems(value).map(item => this.wrapItem(item));
    const ref: OCollectionGroupRef<G, I> = {
      key: this.resolveKey(value, this.groupKeysArray), value, items, busy: false, invalid: false
    };
    // Materialises the column from the start, so the invariant holds from the
    // moment a row exists and a group that arrived without it still emits an
    // empty array rather than dropping the property.
    this.syncGroupItems(ref);
    return ref;
  }

  /** A missing property is an empty collection; a present non-array is a configuration mistake. */
  private readGroupItems(value: G): I[] {
    const raw = (value as any)?.[this.groupItemsColumn];
    if (Util.isDefined(raw) && !Util.isArray(raw)) {
      if (!this.warnedItemsColumn) {
        this.warnedItemsColumn = true;
        console.warn(`[o-collection-editor] "${this.groupItemsColumn}" (group-items-column) is not an array ` +
          'on the incoming groups; treating those groups as empty.');
      }
      return [];
    }
    return Util.isArray(raw) ? raw as I[] : [];
  }

  private wrapItem(value: I): OCollectionItemRef<I> {
    return { key: this.resolveKey(value, this.itemKeysArray), value, busy: false };
  }

  /* -------------------- IDENTITY -------------------- */

  private parseKeys(): void {
    this.groupKeysArray = Util.parseArray(this.groupKeys ?? '');
    this.itemKeysArray = Util.parseArray(this.itemKeys ?? '');
  }

  private resolveKey(value: any, keysArray: string[]): OCollectionKey {
    const real = this.realKey(value, keysArray);
    if (Util.isDefined(real)) {
      // Real identity took over: drop the synthetic one so it cannot come back.
      if (value && value[O_COLLECTION_KEY]) {
        delete value[O_COLLECTION_KEY];
      }
      return real as OCollectionKey;
    }
    return this.syntheticKey(value);
  }

  private realKey(value: any, keysArray: string[]): OCollectionKey | undefined {
    if (!value || !keysArray.length) {
      return undefined;
    }
    const complete = keysArray.every(k => Util.isDefined(value[k]) && value[k] !== '');
    if (!complete) {
      return undefined;
    }
    return JSON.stringify(ServiceUtils.getObjectProperties(value, keysArray));
  }

  private syntheticKey(value: any): OCollectionKey {
    if (!value) {
      return `${SYNTHETIC_KEY_PREFIX}${this.nextSyntheticId++}`;
    }
    if (!value[O_COLLECTION_KEY]) {
      value[O_COLLECTION_KEY] = `${SYNTHETIC_KEY_PREFIX}${this.nextSyntheticId++}`;
    }
    return value[O_COLLECTION_KEY];
  }

  private reresolveIdentities(): void {
    this.groups.forEach(group => {
      group.key = this.resolveKey(group.value, this.groupKeysArray);
      group.items.forEach(item => {
        item.key = this.resolveKey(item.value, this.itemKeysArray);
      });
    });
    this.dedupeKeys();
  }

  /**
   * `@for` tracks by key, and Angular throws NG0955 on duplicate track values.
   * `o-table` never imposed uniqueness on its `keys`, so duplicates are a real
   * possibility in incoming data: warn and fall back to a synthetic key instead
   * of letting the view break.
   */
  private dedupeKeys(): void {
    const seenGroups = new Set<OCollectionKey>();
    this.groups.forEach(group => {
      if (seenGroups.has(group.key)) {
        console.warn(`[o-collection-editor] duplicate group key "${group.key}"; falling back to a synthetic key.`);
        group.key = `${SYNTHETIC_KEY_PREFIX}${this.nextSyntheticId++}`;
      }
      seenGroups.add(group.key);

      const seenItems = new Set<OCollectionKey>();
      group.items.forEach(item => {
        if (seenItems.has(item.key)) {
          console.warn(`[o-collection-editor] duplicate item key "${item.key}"; falling back to a synthetic key.`);
          item.key = `${SYNTHETIC_KEY_PREFIX}${this.nextSyntheticId++}`;
        }
        seenItems.add(item.key);
      });
    });
  }

  /* -------------------- PROJECTED CONTROL NAMES -------------------- */

  /**
   * A DOM-safe stand-in for the row key, memoised so it survives a rebuild.
   *
   * The key itself is a serialized object (`{"id":"7"}`), which is legal but
   * ugly in an element id and in a form control name. Tokens are never derived
   * from the key's characters: sanitising the punctuation away can map two
   * distinct rows onto one name, which is exactly the collision this avoids.
   */
  rowToken(key: OCollectionKey): string {
    let token = this.rowTokens.get(key);
    if (!token) {
      token = `r${this.nextRowToken++}`;
      this.rowTokens.set(key, token);
    }
    return token;
  }

  /**
   * Builds the unique `attr` a control projected into a row needs.
   *
   * Inside `<o-form>` every registered component must have a distinct `attr`, so
   * a projected input with a fixed one registers for the first row and o-form
   * rejects the rest with a `console.error` each — leaving every row but the
   * first out of validation. Deriving the name by hand from `key` works but is
   * easy to get wrong (an index-derived name breaks on reorder) and leaves the
   * consumer to strip those keys from their own save payload afterwards.
   *
   * The names minted here are registered with the form's `ignoreFormCacheKeys`,
   * which is what excludes an attr from both the insert and the update payload,
   * so nothing has to be stripped downstream.
   *
   * Note the generated name changes when the row key does — a new row moving
   * from synthetic to real identity after a save and reload. That is the same
   * rule that already applies to `setGroupBusy`: do not cache it across a reload.
   */
  attrFor = (field: string, key: OCollectionKey): string => {
    const attr = `${this.oattr || 'oce'}_${field}_${this.rowToken(key)}`;
    if (!this.mintedAttrs.has(attr)) {
      this.mintedAttrs.add(attr);
      this.ignoreInFormPayload(attr);
    }
    return attr;
  };

  /**
   * `ignoreFormCacheKeys` is public on `OFormComponent` but absent from the
   * `IOFormParent` interface `form` is typed against — and there is no form at
   * all in the native-forms and standalone contexts.
   */
  private get formIgnoredKeys(): string[] | undefined {
    const keys = (this.form as any)?.ignoreFormCacheKeys;
    return Util.isArray(keys) ? keys as string[] : undefined;
  }

  private ignoreInFormPayload(attr: string): void {
    const keys = this.formIgnoredKeys;
    if (keys && keys.indexOf(attr) === -1) {
      keys.push(attr);
    }
  }

  private releaseMintedAttrs(): void {
    const keys = this.formIgnoredKeys;
    if (keys) {
      this.mintedAttrs.forEach(attr => {
        const at = keys.indexOf(attr);
        if (at !== -1) {
          keys.splice(at, 1);
        }
      });
    }
    this.mintedAttrs.clear();
  }

  /* -------------------- E2E TEST IDS -------------------- */

  /**
   * Composed from this component's own `data-testid` (inherited from
   * `OFormDataComponent`, falls back to `attr`) and a STATIC action's `attr`
   * — one that renders at most once, i.e. `add-group`.
   */
  public getDataTestId(attr: string): string | null {
    return this.dataTestId ? `${this.dataTestId}-${attr}` : null;
  }

  public getRowDataTestId(attr: string, key: OCollectionKey): string | null {
    return this.dataTestId ? `${this.dataTestId}-${attr}-${this.rowToken(key)}` : null;
  }

  /* -------------------- ACTION STYLES -------------------- */
  protected getActionStyleAutoRules(): Record<string, OActionStyle> {
    return {
      'add-group': { variant: 'outline' },
      'add-item': { variant: 'basic' },
      'remove-group': { variant: 'icon' },
      'remove-item': { variant: 'icon' },
      'move-group-up': { variant: 'icon' },
      'move-group-down': { variant: 'icon' },
      'move-item-up': { variant: 'icon' },
      'move-item-down': { variant: 'icon' },
      'drag-group': { variant: 'icon' },
      'drag-item': { variant: 'icon' }
    };
  }

  /**
   * Every `o-button` in the template picks this up on its own through DI (see
   * the `OActionStyleProvider` provider above) as long as it carries the
   * matching `attr` and no explicit `variant`/`importance`/`label` of its own.
   */
  public getResolvedActionStyle(attr: string): OResolvedActionStyle {
    return resolveActionStyle(attr, this.actionStyles, this.getActionStyleAutoRules(), this.globalActionStylesConfig);
  }

  /* -------------------- ADD -------------------- */

  get canAddGroup(): boolean {
    return this.enabled && this.groupsAddable && typeof this.createGroup === 'function';
  }
  get canAddItem(): boolean {
    return this.enabled && this.itemsAddable && typeof this.createItem === 'function';
  }

  addGroup(): void {
    if (!this.canAddGroup) {
      return;
    }
    const index = this.groups.length;
    const value = this.createGroup!(index);
    const ref = this.wrapGroup(value);
    this.groups.push(ref);
    this.emitValue();
    this.onGroupAdded.emit({ group: value, index });
    this.cd.markForCheck();
  }

  addItem(group: OCollectionGroupRef<G, I>): void {
    if (!this.canAddItem) {
      return;
    }
    const groupIndex = this.groups.indexOf(group);
    const itemIndex = group.items.length;
    const value = this.createItem!(group.value, itemIndex);
    group.items.push(this.wrapItem(value));
    this.syncGroupItems(group);
    this.emitValue();
    this.onItemAdded.emit({ group: group.value, item: value, groupIndex, itemIndex });
    this.cd.markForCheck();
  }

  /* -------------------- REMOVE -------------------- */

  async removeGroup(group: OCollectionGroupRef<G, I>): Promise<void> {
    if (!this.enabled || !this.groupsRemovable || this.removingKeys.has(group.key)) {
      return;
    }
    const index = this.groups.indexOf(group);
    if (typeof this.canRemoveGroup === 'function' && !this.canRemoveGroup(group.value, index)) {
      return;
    }
    if (!await this.confirmRemoval(this.confirmRemoveGroupTitle, this.confirmRemoveGroupMessage)) {
      return;
    }

    const key = group.key;
    this.removingKeys.add(key);
    try {
      if (typeof this.removeGroupHandler === 'function') {
        group.busy = true;
        this.cd.markForCheck();
        const accepted = await this.removeGroupHandler(group.value, index);
        group.busy = false;
        if (!accepted) {
          return;
        }
      }
      // Resolve by key, never by the index captured before the await.
      const current = this.groups.findIndex(g => g.key === key);
      if (current === -1) {
        return;
      }
      const [removed] = this.groups.splice(current, 1);
      this.emitValue();
      this.onGroupRemoved.emit({ group: removed.value, index: current });
    } catch (e) {
      group.busy = false;
      console.error('[o-collection-editor] remove-group-handler threw; the group was kept.', e);
    } finally {
      this.removingKeys.delete(key);
      this.cd.markForCheck();
    }
  }

  async removeItem(group: OCollectionGroupRef<G, I>, item: OCollectionItemRef<I>): Promise<void> {
    if (!this.enabled || !this.itemsRemovable || this.removingKeys.has(item.key)) {
      return;
    }
    const groupIndex = this.groups.indexOf(group);
    const itemIndex = group.items.indexOf(item);
    if (typeof this.canRemoveItem === 'function' &&
      !this.canRemoveItem(group.value, item.value, groupIndex, itemIndex)) {
      return;
    }
    if (!await this.confirmRemoval(this.confirmRemoveItemTitle, this.confirmRemoveItemMessage)) {
      return;
    }

    const key = item.key;
    this.removingKeys.add(key);
    try {
      if (typeof this.removeItemHandler === 'function') {
        item.busy = true;
        this.cd.markForCheck();
        const accepted = await this.removeItemHandler(group.value, item.value, groupIndex, itemIndex);
        item.busy = false;
        if (!accepted) {
          return;
        }
      }
      const currentGroup = this.groups.find(g => g.key === group.key);
      if (!currentGroup) {
        return;
      }
      const current = currentGroup.items.findIndex(i => i.key === key);
      if (current === -1) {
        return;
      }
      const [removed] = currentGroup.items.splice(current, 1);
      this.syncGroupItems(currentGroup);
      this.emitValue();
      this.onItemRemoved.emit({
        group: currentGroup.value,
        item: removed.value,
        groupIndex: this.groups.indexOf(currentGroup),
        itemIndex: current
      });
    } catch (e) {
      item.busy = false;
      console.error('[o-collection-editor] remove-item-handler threw; the item was kept.', e);
    } finally {
      this.removingKeys.delete(key);
      this.cd.markForCheck();
    }
  }

  /** An empty message input means "no dialog, remove straight away". */
  private async confirmRemoval(title: string, message: string): Promise<boolean> {
    if (!message) {
      return true;
    }
    return !!await this.dialogService.confirm(title || 'CONFIRM', message);
  }

  /* -------------------- REORDER -------------------- */

  dropGroup(event: CdkDragDrop<OCollectionGroupRef<G, I>[]>): void {
    if (!this.groupsDraggable || !this.enabled || event.previousIndex === event.currentIndex) {
      return;
    }
    this.moveGroup(event.previousIndex, event.currentIndex);
  }

  dropItem(group: OCollectionGroupRef<G, I>, event: CdkDragDrop<OCollectionItemRef<I>[]>): void {
    if (!this.itemsDraggable || !this.enabled || event.previousIndex === event.currentIndex) {
      return;
    }
    this.moveItem(group, event.previousIndex, event.currentIndex);
  }

  /** Keyboard alternative to dragging; cdk drag-drop provides none. */
  moveGroup(previousIndex: number, currentIndex: number): void {
    if (currentIndex < 0 || currentIndex >= this.groups.length) {
      return;
    }
    const group = this.groups[previousIndex];
    moveItemInArray(this.groups, previousIndex, currentIndex);
    this.emitValue();
    this.announceMove(currentIndex, this.groups.length);
    this.onGroupMoved.emit({ group: group.value, previousIndex, currentIndex });
    this.cd.markForCheck();
  }

  moveItem(group: OCollectionGroupRef<G, I>, previousIndex: number, currentIndex: number): void {
    if (currentIndex < 0 || currentIndex >= group.items.length) {
      return;
    }
    const item = group.items[previousIndex];
    moveItemInArray(group.items, previousIndex, currentIndex);
    this.syncGroupItems(group);
    this.emitValue();
    this.announceMove(currentIndex, group.items.length);
    this.onItemMoved.emit({
      group: group.value,
      item: item.value,
      groupIndex: this.groups.indexOf(group),
      previousIndex,
      currentIndex
    });
    this.cd.markForCheck();
  }

  private announceMove(currentIndex: number, total: number): void {
    this.moveAnnouncement = `${currentIndex + 1} / ${total}`;
  }

  /* -------------------- CHANGES FROM PROJECTED TEMPLATES -------------------- */

  /**
   * Called by the consumer's template through the `notifyChange` context entry,
   * and by the `focusout` safety net on every row.
   *
   * `force: false`, because this fires on any focus exit — moving between two
   * fields of the same row, or the confirmation dialog closing — and emitting
   * unconditionally would mark the surrounding form dirty and push this attr
   * into the next update payload with nothing edited.
   */
  onGroupValueChanged(_group: OCollectionGroupRef<G, I>): void {
    this.emitValue(false);
  }

  onItemValueChanged(_group: OCollectionGroupRef<G, I>, _item: OCollectionItemRef<I>): void {
    this.emitValue(false);
  }

  /* -------------------- VALIDATION -------------------- */

  /**
   * Imperative entry point, shaped for o-form's `form-data-validation-function`
   * (which alerts with `messages.join('</br>')`, so they must be resolved text,
   * not i18n keys).
   */
  validateStructure(): OFormValidation {
    const errors = this.refreshValidation();
    this.getControl()?.markAsTouched();
    this.cd.markForCheck();
    if (!errors) {
      return { valid: true };
    }
    const messages: string[] = [];
    if (errors['minGroups']) {
      messages.push(`${this.oTranslate.get(this.minGroupsText)}: ${errors['minGroups'].required}`);
    }
    if (errors['minItemsPerGroup']) {
      messages.push(`${this.oTranslate.get(this.minItemsText)}: ${errors['minItemsPerGroup'].required}`);
    }
    return { valid: false, messages };
  }

  /**
   * Single source of truth for validation: recomputes the per-row `invalid`
   * flags and returns the error object. Both `validate()` (Validator) and
   * `validateStructure()` go through here so they can never diverge.
   */
  private computeErrors(): ValidationErrors | null {
    const errors: ValidationErrors = {};
    const groupsBelowMin: OCollectionKey[] = [];

    this.groups.forEach(group => {
      const belowMin = group.items.length < this.minItemsPerGroup;
      group.invalid = belowMin;
      if (belowMin) {
        groupsBelowMin.push(group.key);
      }
    });

    if (this.groups.length < this.minGroups) {
      errors['minGroups'] = { required: this.minGroups, actual: this.groups.length };
    }
    if (groupsBelowMin.length) {
      errors['minItemsPerGroup'] = {
        required: this.minItemsPerGroup,
        actual: Math.min(...this.groups.map(g => g.items.length)),
        groups: groupsBelowMin
      };
    }
    return Object.keys(errors).length ? errors : null;
  }

  /** Recomputes and pushes the errors onto the internal control (drives `hasError()`). */
  private refreshValidation(): ValidationErrors | null {
    const errors = this.computeErrors();
    const control = this.getControl();
    if (control) {
      control.setErrors(errors, { emitEvent: false });
    }
    return errors;
  }

  /**
   * The structural errors live on the internal control, so they must survive
   * whatever `resolveValidators()` sets. Kept as a validator function so
   * `updateValueAndValidity()` cannot wipe them.
   */
  override resolveValidators(): ValidatorFn[] {
    const validators = super.resolveValidators();
    validators.push(() => this.computeErrors());
    return validators;
  }

  override getSQLType(): number {
    return SQLTypes.OTHER;
  }

  /* -------------------- BUSY -------------------- */

  setGroupBusy(key: OCollectionKey, busy: boolean): void {
    const group = this.groups.find(g => g.key === key);
    if (!group) {
      console.warn(`[o-collection-editor] setGroupBusy: unknown key "${String(key)}". ` +
        'Keys change when a row goes from synthetic to real identity — do not cache them across a reload.');
      return;
    }
    group.busy = busy;
    this.cd.markForCheck();
  }

  setItemBusy(groupKey: OCollectionKey, itemKey: OCollectionKey, busy: boolean): void {
    const item = this.groups.find(g => g.key === groupKey)?.items.find(i => i.key === itemKey);
    if (!item) {
      console.warn(`[o-collection-editor] setItemBusy: unknown key "${String(groupKey)}"/"${String(itemKey)}". ` +
        'Keys change when a row goes from synthetic to real identity — do not cache them across a reload.');
      return;
    }
    item.busy = busy;
    this.cd.markForCheck();
  }

  /* -------------------- TEMPLATE HELPERS -------------------- */

  get isDisabled(): boolean {
    return !this.enabled || this.isReadOnly;
  }

  /** Read-only reflection of the data; re-read every render so typing shows up. */
  getGroupTitle(group: OCollectionGroupRef<G, I>): string {
    return this.readColumn(group.value, this.groupTitleColumn);
  }
  getGroupDescription(group: OCollectionGroupRef<G, I>): string {
    return this.readColumn(group.value, this.groupDescriptionColumn);
  }
  getItemTitle(item: OCollectionItemRef<I>): string {
    return this.readColumn(item.value, this.itemTitleColumn);
  }
  getItemDescription(item: OCollectionItemRef<I>): string {
    return this.readColumn(item.value, this.itemDescriptionColumn);
  }

  private readColumn(value: any, column?: string): string {
    if (!Util.isDefined(column) || !value) {
      return '';
    }
    const raw = value[column as string];
    return Util.isDefined(raw) ? String(raw) : '';
  }

  groupContext(group: OCollectionGroupRef<G, I>, index: number): any {
    return {
      $implicit: group.value,
      group: group.value,
      key: group.key,
      index,
      busy: group.busy,
      invalid: group.invalid,
      disabled: this.isDisabled,
      // Pre-bound to this row, so the template writes attrFor('name').
      attrFor: (field: string) => this.attrFor(field, group.key),
      notifyChange: () => this.onGroupValueChanged(group)
    };
  }

  itemContext(
    group: OCollectionGroupRef<G, I>,
    item: OCollectionItemRef<I>,
    groupIndex: number,
    itemIndex: number
  ): any {
    return {
      $implicit: item.value,
      item: item.value,
      group: group.value,
      groupKey: group.key,
      key: item.key,
      groupIndex,
      itemIndex,
      busy: item.busy,
      disabled: this.isDisabled,
      attrFor: (field: string) => this.attrFor(field, item.key),
      notifyChange: () => this.onItemValueChanged(group, item)
    };
  }
}
