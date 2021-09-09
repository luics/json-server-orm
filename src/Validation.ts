import Ajv, { ValidateFunction } from 'ajv';
import { JSONType } from '.';

export default class Validation {
  validation: { [key: string]: ValidateFunction<any> } = {};

  constructor(public schema: unknown) {
    const ajv = new Ajv();
    ajv.addKeyword('propertyOrder'); // from TJS
    ajv.addSchema(schema as any);

    Object.keys((schema as any).definitions).forEach((k) => {
      const v = ajv.getSchema(`#/definitions/${k}`);
      if (v) this.validation[k] = v;
    });
  }

  /** post -> Post */
  static key2dn(key: string): string {
    return key[0].toUpperCase() + key.substr(1);
  }

  /** Post -> post */
  static dn2key(dn: string): string {
    return dn.toLowerCase();
  }

  /** posts -> Post */
  static tn2dn(tn: string): string {
    return tn[0].toUpperCase() + tn.substr(1, tn.length - 2);
  }

  getOwnProperties(name: string): { [k: string]: any } {
    const fields = this.getOwnFields(name);
    const allProps = this.getProperties(name);
    const props = {} as any;

    if (allProps) {
      fields?.forEach((f) => {
        props[f] = allProps[f];
      });
    }
    return props;
  }

  getOwnFields(name: string): string[] {
    const ps = this.getProperties(name);
    const fields: string[] = [];
    if (!ps) return fields;

    Object.entries(ps).forEach(([k, v]) => {
      const type = v.type as JSONType;
      if (
        !v.$ref && //
        !(type === 'array' && v.items?.$ref) // array items
      ) {
        fields.push(k);
      }
    });
    // keep definition order
    const order =
      ((this.schema as any).definitions[Validation.tn2dn(name)]?.propertyOrder as string[]) ?? [];
    const retFields: string[] = [];
    order.forEach((f) => fields.includes(f) && retFields.push(f));

    return retFields;
  }

  private getProperties(name: string): { [k: string]: any } {
    return (
      ((this.schema as any).definitions[Validation.tn2dn(name)]?.properties as {
        [k: string]: any;
      }) ?? {}
    );
  }

  // @see https://ajv.js.org/guide/modifying-data.html#assigning-defaults
  getDefaultItem(name: string): any {
    const ps = this.getOwnProperties(name);
    const props = {} as any;
    if (ps) {
      Object.entries(ps).forEach(([k, v]) => {
        const type = v.type as JSONType;
        switch (type) {
          case 'number':
          case 'integer':
            props[k] = 0;
            break;
          case 'string':
            props[k] = '';
            break;
          case 'boolean':
            props[k] = false;
            break;
          case 'object':
            props[k] = {};
            break;
          case 'array':
            props[k] = [];
            break;
          case 'null':
            props[k] = null;
            break;
          default:
            break;
        }
      });
    }
    return props;
  }
}
