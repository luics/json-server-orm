/* eslint-disable @typescript-eslint/no-empty-interface */

/**
 * @additionalProperties false
 */
export interface Schema {}

export interface PluralSchema extends Schema {
  /**
   * @TJS-type integer
   */
  id: number;
}

/**
 * @additionalProperties true
 */
export interface SingularSchema extends Schema {}
