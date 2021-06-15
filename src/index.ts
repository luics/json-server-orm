export type Order = 'asc' | 'desc';
export type OperatorNameValue = { name: string, value: number };
export type NameValue = { name: string, value: any };
export interface Schema { id: number; }
export type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}
export { Table } from './Table';
export { QueryOptions } from './QueryOptions';
export { UrlBuilder } from './UrlBuilder';