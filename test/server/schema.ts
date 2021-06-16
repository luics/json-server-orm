import { PluralSchema, SingularSchema } from '../../src';

export interface Post extends PluralSchema {
  /**
   * @minLength 5
   * @maxLength 50
   */
  title: string,
  /**
   * @TJS-type integer
   */
  userId: number,

  tags?: string[],
  meta?: object,
  private?: boolean,
  weight?: number,
  test?: null,

  user?: User,
  comments?: Comment[],
}

export interface User extends PluralSchema {
  /**
   * @minLength 1
   * @maxLength 20
   */
  name: string,
  token: string,
  posts?: Post[],
}

export interface Comment extends PluralSchema {
  /**
   * @minLength 5
   * @maxLength 140
   */
  body: string,
  postId: number,
  post?: Post,
}

export interface Profile extends SingularSchema {
  name: string,
  desc: string,
}