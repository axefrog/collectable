import test from 'ava';
import { empty, prependArrayMapped } from '../../src';
import { arrayFrom } from '../../src/internals';

const fn = (s: string, i: number) => `[${s}, ${i}]`;

test('should return the original list if called with an empty list', t => {
  const list = empty<string>();
  const prepended = prependArrayMapped(fn, [], list);
  t.is(list._size, 0);
  t.is(list, prepended);
});

test('should append elements so that their order in the list matches the source array', t => {
  const values = ['foo', 'bar', 'baz'];
  const mappedValues = values.map(fn);
  const list = prependArrayMapped(fn, values, empty<string>());
  t.is(list._size, 3);
  t.deepEqual(arrayFrom(list), mappedValues);
});
