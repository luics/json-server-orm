/* eslint-disable max-classes-per-file */
import { Plural, Singular } from './x-server-orm/src';

export * from './x-server-orm/src';

export class JSPlural<T> extends Plural<T> {}

export class JSSingular<T> extends Singular<T> {}
