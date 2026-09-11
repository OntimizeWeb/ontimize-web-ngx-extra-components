/**
 * Identity of a group or an item inside `o-collection-editor`.
 *
 * Always a `string`, never a `symbol`: the consumer needs to be able to build
 * strings from it (typically a unique `attr` per projected input inside an
 * `<o-form>`, see the component docs), and `'x' + Symbol()` throws a TypeError.
 *
 * Two flavours, distinguishable by prefix:
 * - real identity, derived from the `group-keys`/`item-keys` columns and
 *   serialized (e.g. `{"id":"7"}`);
 * - synthetic identity for rows that are not persisted yet, always prefixed
 *   `oce:` so it can never collide with a real one.
 */
export type OCollectionKey = string; // NOSONAR: kept as a named alias for API readability, not for type safety

/** Payload of `o-collection-editor`'s `onGroupAdded` / `onGroupRemoved` outputs. */
export interface OCollectionGroupEvent<G = any> {
  group: G;
  index: number;
}

/** Payload of `o-collection-editor`'s `onItemAdded` / `onItemRemoved` outputs. */
export interface OCollectionItemEvent<G = any, I = any> {
  group: G;
  item: I;
  groupIndex: number;
  itemIndex: number;
}

/** Payload of `o-collection-editor`'s `onGroupMoved` output. */
export interface OCollectionGroupMovedEvent<G = any> {
  group: G;
  previousIndex: number;
  currentIndex: number;
}

/** Payload of `o-collection-editor`'s `onItemMoved` output. */
export interface OCollectionItemMovedEvent<G = any, I = any> {
  group: G;
  item: I;
  groupIndex: number;
  previousIndex: number;
  currentIndex: number;
}

/** Builds a brand new group. Without it, "add group" stays disabled. */
export type OCollectionCreateGroup<G = any> = (index: number) => G;

/** Builds a brand new item for a group. Without it, "add item" stays disabled. */
export type OCollectionCreateItem<G = any, I = any> = (group: G, index: number) => I;

/** Synchronous veto for a group removal. */
export type OCollectionCanRemoveGroup<G = any> = (group: G, index: number) => boolean;

/** Synchronous veto for an item removal. */
export type OCollectionCanRemoveItem<G = any, I = any> = (
  group: G,
  item: I,
  groupIndex: number,
  itemIndex: number
) => boolean;

/**
 * Deferred group removal. Resolving `true` removes the row, `false` (or
 * throwing) keeps it. The row is marked busy while it is pending.
 */
export type OCollectionRemoveGroupHandler<G = any> = (
  group: G,
  index: number
) => Promise<boolean> | boolean;

/**
 * Deferred item removal. Resolving `true` removes the row, `false` (or
 * throwing) keeps it. The row is marked busy while it is pending.
 */
export type OCollectionRemoveItemHandler<G = any, I = any> = (
  group: G,
  item: I,
  groupIndex: number,
  itemIndex: number
) => Promise<boolean> | boolean;
