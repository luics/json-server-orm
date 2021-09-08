export type V = string | number | boolean;
export type KVO = { [k: string]: V | V[] };

export type Order = 'asc' | 'desc';
export type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}

// @see https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_deprecated_apis
export const isObject = (v: unknown): boolean => v !== null && typeof v === 'object';
export const isPrimitive = (v: unknown): boolean =>
  (typeof v !== 'object' && typeof v !== 'function') || v === null;
export const isString = (v: unknown): boolean => typeof v === 'string';
export const isNumber = (v: unknown): boolean => typeof v === 'number';
export const isN = isNumber;
export const { isInteger } = Number;
export const { isArray, isArray: isA } = Array;
export const isBoolean = (v: unknown): boolean => typeof v === 'boolean';
export const isNull = (v: unknown): boolean => v === null;
export const isUndefined = (v: unknown): boolean => v === undefined;
export const isNullOrUndefined = (v: unknown): boolean => v === undefined || v === null;
export const isFunction = (v: unknown): boolean => typeof v === 'function';

export const pf = parseFloat;
export const pi = parseInt;
export const { assign, keys, values, entries } = Object;

export const arr = (v: V | V[]): V[] => (isA(v) ? v : [v]);
export const isEmpty = (v?: KVO): boolean => (v ? !Object.keys(v).length : false);
