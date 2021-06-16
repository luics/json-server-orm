export type Order = 'asc' | 'desc';
export type KVO = { [k: string]: any };
export type OperatorNameValue = { name: string, value: number };
export type NameValue = { name: string, value: any };
export type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}
export { Schema, PluralSchema, SingularSchema } from './schema';
export { Plural, Plural as Table } from './Plural';
export { Singular, Singular as Object } from './Singular';