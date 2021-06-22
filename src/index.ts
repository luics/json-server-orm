import { Plural } from './Plural';
import { Singular } from './Singular';
import { PluralSchema, SingularSchema } from './schema';

export * from './types';
export { Schema, PluralSchema, SingularSchema } from './schema';
export { Validation } from './Validation';
export { Plural, Plural as Table };
export { Singular, Singular as Object };
export type DB = { [k: string]: (Plural<PluralSchema> | Singular<SingularSchema>) };