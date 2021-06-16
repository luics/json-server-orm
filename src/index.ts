export type Order = 'asc' | 'desc';
export type OperatorNameValue = { name: string, value: number };
export type NameValue = { name: string, value: any };
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Schema { }
export interface PluralSchema extends Schema { id: number; }
export type SingularSchema = Schema;
export type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}
export { Plural, Plural as Table } from './Plural';
export { Singular, Singular as Object } from './Singular';