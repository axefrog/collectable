import { ComparatorFn, KeyedSelectorFn, MutationContext, isBoolean, isMutationContext } from '@collectable/core';
import { SortedMapEntry, SortedMapStructure, emptySortedMap } from '../internals';

export function empty<K, V> (compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V>;
export function empty<K, V, U> (compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V>;
export function empty<K, V> (mutable: boolean|MutationContext, compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V>;
export function empty<K, V, U> (mutable: boolean|MutationContext, compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V>;
export function empty<K, V, U> (
  arg0?: boolean|MutationContext|ComparatorFn<SortedMapEntry<K, V, U>>,
  arg1?: ComparatorFn<SortedMapEntry<K, V, U>>|KeyedSelectorFn<V, K, U>,
  select?: KeyedSelectorFn<V, K, U>
): SortedMapStructure<K, V, U> {
  var mutable: boolean|MutationContext;
  var compare: ComparatorFn<SortedMapEntry<K, V, U>>|undefined;
  if(typeof arg0 === 'function') {
    compare = arg0;
    if(typeof arg1 === 'function') {
      select = <KeyedSelectorFn<V, K, U>>arg1;
    }
    mutable = false;
  }
  else {
    compare = <ComparatorFn<SortedMapEntry<K, V, U>>>arg1;
    mutable = isMutationContext(arg0) || isBoolean(arg0) ? arg0 : false;
  }
  return emptySortedMap<K, V, U>(compare, select, mutable);
}
