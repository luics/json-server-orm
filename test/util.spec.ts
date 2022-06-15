import 'mocha';
import { ok } from 'assert';
import {
  isObject,
  isPrimitive,
  isBoolean,
  isEmpty,
  isBrowser,
  isFunction,
  isNull,
  isUndefined,
  isNullOrUndefined,
  isNumber,
  isString,
} from '../src/util';

const fn = () => true;

describe('util', () => {
  it('fn', () => ok(fn()));

  it('isBoolean', () => {
    ok(isObject({}));
    ok(isObject({ a: 1 }));
    ok(!isObject(1));
    ok(!isObject(null));
    ok(!isObject(undefined));
  });

  it('isPrimitive', () => {
    ok(isPrimitive(1));
    ok(isPrimitive('a'));
    ok(isPrimitive(true));
    ok(isPrimitive(null));
    ok(isPrimitive(undefined));
    ok(!isPrimitive({}));
    ok(!isPrimitive(fn));
  });

  it('isBoolean', () => {
    ok(isBoolean(true));
    ok(isBoolean(false));
    ok(!isBoolean(1));
  });

  it('isString', () => {
    ok(isString('1'));
    ok(isString(`1`));
    ok(!isString(1));
  });

  it('isNumber', () => {
    ok(isNumber(1));
    ok(isNumber(1.2));
    ok(isNumber(0o1));
    ok(isNumber(0x1));
    ok(!isNumber('1'));
  });

  it('isNull', () => {
    ok(isNull(null));
    ok(!isNull(undefined));
  });

  it('isUndefined', () => {
    ok(isUndefined(undefined));
    ok(!isUndefined(null));
  });

  it('isNullOrUndefined', () => {
    ok(isNullOrUndefined(null));
    ok(isNullOrUndefined(undefined));
    ok(!isNullOrUndefined(1));
  });

  it('isFunction', () => {
    ok(isFunction(fn));
    ok(!isFunction({}));
  });

  it('isBrowser', () => {
    ok(!isBrowser());
  });

  it('isEmpty', () => {
    ok(isEmpty());
    ok(isEmpty(undefined));
    ok(isEmpty({}));
    ok(!isEmpty({ a: 1 }));
    ok(isEmpty([]));
    ok(!isEmpty([1]));
  });
});
