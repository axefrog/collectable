import { Associative, unwrap, unwrapKey } from '@collectable/core';
import { HashMapStructure } from '../HashMap';
import { identity, iterator } from './index';
import { Leaf } from '../nodes';

export function unwrapInto<K, V> (target: Associative<V>, map: HashMapStructure<K, V>): Associative<V> {
  var it = iterator(map._root, identity);
  var current: IteratorResult<Leaf<K, V>>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var value = entry.value;
    target[unwrapKey(entry.key)] = unwrap<V>(value);
  }
  return target;
}