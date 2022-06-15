import { KVO, NKVO, Order } from '.';

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
  contain?: string[];

  // avg?: string[];
  // count?: string[];
  // max?: string[];
  // min?: string[];
  // sum?: string[];
  // std?: string[];

  param?: KVO;
}
