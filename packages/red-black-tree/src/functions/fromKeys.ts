import * as C from '@collectable/core';
import { ComparatorFn } from '@collectable/core';
import { RedBlackTreeStructure, createTree, isRedBlackTree } from '../internals';
import { iterateKeysFromFirst } from './iterateKeysFromFirst';
import { set } from './set';

export function fromKeys<K> (compare: ComparatorFn<K>, keys: K[]|RedBlackTreeStructure<K, any>|Iterable<K>, mutability?: C.PreferredContext): RedBlackTreeStructure<K> {
  const tree = C.modify(createTree<K, null>(compare, mutability));
  if(Array.isArray(keys)) {
    for(var i = 0; i < keys.length; i++) {
      set(keys[i], null, tree);
    }
  }
  else {
    const iterable = isRedBlackTree<K>(keys) ? iterateKeysFromFirst(keys) : keys;
    const it = iterable[Symbol.iterator]();
    var current: IteratorResult<K>;
    while(!(current = it.next()).done) {
      set(current.value, null, tree);
    }
  }
  return C.commit(tree);
}
