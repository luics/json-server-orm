/* eslint-disable @typescript-eslint/ban-types */
import { PluralSchema, SingularSchema } from '../../src/schema';

export interface Post extends PluralSchema {
  /**
   * @minLength 5
   * @maxLength 50
   */
  title: string;
  /**
   * @TJS-type integer
   */
  userId: number;

  /**
   * @TJS-type integer
   */
  groupId: number;

  // tags?: string[];
  // meta?: object;
  // private?: boolean;
  // weight?: number;
  // test?: null;

  user?: User;
  group?: Group;
  comments?: Comment[];
}

export interface User extends PluralSchema {
  /**
   * @minLength 1
   * @maxLength 20
   */
  name: string;
  token: string;
  posts?: Post[];
}

export interface Comment extends PluralSchema {
  /**
   * @minLength 5
   * @maxLength 140
   */
  body: string;
  /**
   * @TJS-type integer
   */
  postId: number;
  post?: Post;
}

export interface Group extends PluralSchema {
  /**
   * @minLength 1
   * @maxLength 20
   */
  name: string;
}

/**
 * @additionalProperties true
 */
export interface Profile extends SingularSchema {
  /**
   * @minLength 5
   * @maxLength 20
   */
  name: string;
  desc?: string;
}
