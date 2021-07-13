import Ajv, { ValidateFunction } from 'ajv';
import schema from './schema.json';

const ajv = new Ajv();
ajv.addKeyword('propertyOrder'); // from TJS
ajv.addSchema(schema);

const keys = Object.keys(schema.definitions).map((k) => k.toLowerCase()); // [post, ]
export const key2DefinitionName = (k: string): string => (k[0].toUpperCase() + k.substr(1)); // post -> Post

export const validation: { [key: string]: ValidateFunction<any> } = {};
keys.forEach((k) => {
  validation[k] = ajv.getSchema(`#/definitions/${key2DefinitionName(k)}`)!;
});
