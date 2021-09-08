import { KVO, NKVO, Order } from '..';

/**
 * @see https://github.com/typicode/json-server#routes
 */
export interface QueryOptions {
  ids?: number[];
  limit?: number;
  page?: number;
  sort?: string;
  order?: Order;
  start?: number;
  end?: number;
  gte?: NKVO;
  lte?: NKVO;
  ne?: NKVO;
  like?: KVO;
  q?: string;
  embed?: string[];
  expand?: string[];

  param?: KVO;
}
