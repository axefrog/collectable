import {
  Mutation, Associative, IndexedCollection, ComparatorFn, KeyedSelectorFn,
  isObject, isDefined, hashIterator, unwrap, unwrapKey
} from '@collectable/core';
import {RedBlackTree} from '@collectable/red-black-tree';
import {HashMap} from '@collectable/map';
import {Entry} from './types';
import {setItem} from './values';
import {isEqual, get, set, has, update} from '../functions';
import {iteratePairs} from './iterate';

type UntypedSortedMapInternal = SortedMapStructure<any, any, any>;
type UntypedSortedMapItem = Entry<any, any, any>;

export class SortedMapStructure<K, V, U = any> implements IndexedCollection<K, V, [K, V], Associative<V>> {
  /** @internal */
  constructor(
    mctx: Mutation.Context,
    public _indexed: HashMap.Instance<K, Entry<K, V, U>>,
    public _sorted: RedBlackTree.Instance<Entry<K, V, U>, null>,
    public _compare: ComparatorFn<Entry<K, V, U>>,
    public _select: KeyedSelectorFn<K, V, U>|undefined,
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  readonly '@@mctx': Mutation.Context;

  /** @internal */
  get '@@size'(): number { return this._indexed['@@size']; }

  /** @internal */
  get '@@is-collection'(): true { return true; }

  /** @internal */
  '@@clone'(mctx: Mutation.Context): SortedMapStructure<K, V, U> {
    var sctx = Mutation.asSubordinateContext(mctx);
    return new SortedMapStructure<K, V, U>(
      mctx,
      Mutation.clone(this._indexed, sctx),
      Mutation.clone(this._sorted, sctx),
      this._compare,
      this._select
    );
  }

  /** @internal */
  '@@equals'(other: SortedMapStructure<K, V, U>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash'(): number {
    return hashIterator(iteratePairs(this));
  }

  /** @internal */
  '@@unwrap'(): Associative<V> {
    return unwrap(this);
  }

  /** @internal */
  '@@unwrapInto'(target: Associative<V>): Associative<V> {
    var it = RedBlackTree.keys(this._sorted);
    var current: IteratorResult<Entry<K, V, U>>;
    while(!(current = it.next()).done) {
      var entry = current.value;
      target[unwrapKey(entry.key)] = unwrap<any>(entry.value);
    }
    return target;
  }

  /** @internal */
  '@@createUnwrapTarget'(): Associative<V> {
    return {};
  }

  /** @internal */
  '@@get'(key: K): V | undefined {
    return get(key, this);
  }

  /** @internal */
  '@@has'(key: K): boolean {
    return has(key, this);
  }

  /** @internal */
  '@@set'(key: K, value: V): this {
    return <this>set(key, value, this);
  }

  /** @internal */
  '@@update'(updater: (value: V, map: this) => any, key: K): this {
    return <this>update(updater, key, this);
  }

  /** @internal */
  '@@verifyKey'(key: K): boolean {
    return true;
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return iteratePairs(this);
  }
}

export function isSortedMap<K, V, U>(arg: any): arg is SortedMapStructure<K, V, U> {
  return isObject(arg) && arg instanceof SortedMapStructure;
}

export function cloneSortedMap<K, V, U>(map: SortedMapStructure<K, V, U>, clear?: boolean, mutability?: Mutation.PreferredContext): SortedMapStructure<K, V, U> {
  var mctx = Mutation.selectContext(mutability);
  var sctx = Mutation.asSubordinateContext(mctx);
  var keys: HashMap.Instance<K, Entry<K, V, any>>;
  var sorted: RedBlackTree.Instance<Entry<K, V, any>, null>;
  if(clear) {
    keys = HashMap.empty<K, Entry<K, V, any>>(sctx);
    sorted = RedBlackTree.empty<Entry<K, V, any>, null>(map._compare, sctx);
  }
  else {
    keys = Mutation.clone(map._indexed, sctx);
    sorted = Mutation.clone(map._sorted, sctx);
  }
  return new SortedMapStructure<K, V, U>(mctx, keys, sorted, map._compare, map._select);
}

export function createMap<K, V, U>(values: [K, V][]|Iterable<[K, V]>, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>, mutability?: Mutation.PreferredContext): SortedMapStructure<K, V, U> {
  var map = Mutation.modify(emptySortedMap<K, V, U>(compare, select, mutability));
  var indexed = map._indexed;
  var sorted = map._sorted;

  if(Array.isArray(values)) {
    for(var i = 0; i < values.length; i++) {
      var value = values[i];
      setItem(value[0], value[1], indexed, sorted, select);
    }
  }
  else {
    var it = values[Symbol.iterator]();
    var current: IteratorResult<[K, V]>;
    while(!(current = it.next()).done) {
      value = current.value;
      setItem(value[0], value[1], indexed, sorted, select);
    }
  }

  return Mutation.commit(map);
}

export function extractTree<K, V, U>(set: SortedMapStructure<K, V, U>): RedBlackTree.Instance<Entry<K, V, U>, null> {
  return set._sorted;
}

export function extractMap<K, V, U>(set: SortedMapStructure<K, V, U>): HashMap.Instance<K, Entry<K, V, U>> {
  return set._indexed;
}

const DEFAULT_COMPARATOR: ComparatorFn<UntypedSortedMapItem> = (a: UntypedSortedMapItem, b: UntypedSortedMapItem) => a.index - b.index;
const COMPARATOR_CACHE = new WeakMap<Function, ComparatorFn<UntypedSortedMapItem>>();

function createComparatorFn<K, V, U>(compare: ComparatorFn<Entry<K, V, U>>): ComparatorFn<Entry<K, V, U>> {
  var fn = COMPARATOR_CACHE.get(compare);
  return isDefined(fn) ? fn : (fn = function(a: Entry<K, V, U>, b: Entry<K, V, U>): number {
    var n = compare(a, b);
    return n === 0 ? DEFAULT_COMPARATOR(a, b) : n;
  }, COMPARATOR_CACHE.set(compare, fn), fn);
}

export function emptySortedMap<K, V, U = any>(compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>, mutability?: Mutation.PreferredContext): SortedMapStructure<K, V, U> {
  var comparator = isDefined(compare) ? createComparatorFn(compare) : DEFAULT_COMPARATOR;
  var mctx = Mutation.selectContext(mutability);

  if(Mutation.isImmutableContext(mctx) && comparator === DEFAULT_COMPARATOR) {
    return isDefined(EMPTY) ? EMPTY : (EMPTY = new SortedMapStructure<K, V, U>(mctx, HashMap.empty<any, any>(), RedBlackTree.empty<any, any>(comparator), comparator, void 0));
  }

  var sctx = Mutation.asSubordinateContext(mctx);
  var map = HashMap.empty<K, Entry<K, V, U>>(sctx);
  var tree = RedBlackTree.empty<Entry<K, V, U>, null>(comparator, sctx);
  return new SortedMapStructure<K, V, U>(mctx, map, tree, comparator, select);
}

var EMPTY: UntypedSortedMapInternal;
