import { NameValue, OperatorNameValue, Order } from '.';

/**
 * @see https://github.com/typicode/json-server#routes
 */
export interface QueryOptions {
  ids?: number[],
  limit?: number,
  page?: number,
  sort?: string,
  order?: Order,
  start?: number,
  end?: number,
  gte?: OperatorNameValue[],
  lte?: OperatorNameValue[],
  ne?: OperatorNameValue[],
  like?: NameValue[],
  q?: string,
  embed?: string[],
  expand?: string[],

  param?: NameValue[],
}