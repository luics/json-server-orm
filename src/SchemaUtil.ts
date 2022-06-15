import { entries, isEmpty } from './util';
import { JSONType } from '.';

// const keywords = ['meta'];

export class SchemaUtil {
  singulars: string[] = [];

  plurals: string[] = [];

  pluralOns: string[] = [];

  schema: any;

  constructor(schema: unknown) {
    this.schema = schema;

    entries(this.defs).forEach(([dn, def]) => {
      const isSingular = def.additionalProperties;
      const tn = isSingular ? dn.toLowerCase() : SchemaUtil.dn2tn(dn);
      if (isSingular) this.singulars.push(tn);
      else {
        this.plurals.push(tn);
        this.pluralOns.push(SchemaUtil.dn2on(dn));
      }
    });
  }

  _defs!: { [k: string]: any };

  get defs(): { [k: string]: any } {
    if (!this._defs) {
      this._defs = {};
      entries(this.schema.definitions).forEach(([dn, def]) => {
        // if (keywords.includes(dn.toLowerCase())) return;
        this._defs[dn] = def;
      });
    }

    return this._defs;
  }

  isSingular(tn: string): boolean {
    return this.singulars.includes(tn);
  }

  isPlural(tn: string): boolean {
    return this.plurals.includes(tn);
  }

  isPluralOn(on: string): boolean {
    return this.pluralOns.includes(on);
  }

  /**
   * post -> Post
   */
  static on2dn(on: string): string {
    return on[0].toUpperCase() + on.substr(1);
  }

  /**
   * post -> posts
   */
  static on2tn(on: string): string {
    return `${on}s`;
  }

  /**
   * Post -> post
   */
  static dn2on(dn: string): string {
    return dn.toLowerCase();
  }

  /**
   * Post -> posts
   */
  static dn2tn(dn: string): string {
    return `${dn.toLowerCase()}s`;
  }

  /**
   * posts -> Post
   */
  static tn2dn(tn: string): string {
    return tn[0].toUpperCase() + tn.substr(1, tn.length - 2);
  }

  /**
   * posts -> post
   */
  static tn2on(tn: string): string {
    return tn.substr(0, tn.length - 1);
  }

  isRequiredProperty(dn: string, pn: string): boolean {
    const required = this.defs[dn]?.required ?? [];
    return required.includes(pn);
  }

  getOwnProperties(dn: string): { [k: string]: any } {
    const fields = this.getOwnFields(dn);
    const allProps = this.getProperties(dn);
    const props: any = {};

    fields.forEach((f: any) => {
      props[f] = allProps[f];
    });
    return props;
  }

  getOwnFields(dn: string): string[] {
    if (!(dn in this.defs)) return [];

    const ps = this.defs[dn].properties as { [k: string]: any };
    const fields: string[] = [];

    Object.entries(ps).forEach(([k, v]) => {
      const type = v.type as JSONType;
      if (
        !v.$ref && //
        !(type === 'array' && v.items.$ref) // array items
      ) {
        fields.push(k);
      }
    });
    // keep definition order
    const order = this.defs[dn].propertyOrder; // ?? [];
    const retFields: string[] = [];
    order.forEach((f: any) => fields.includes(f) && retFields.push(f));

    return retFields;
  }

  getProperties(dn: string): { [k: string]: any } {
    return this.defs[dn]?.properties ?? {};
  }

  getProperty(dn: string, k: string): any {
    return this.getProperties(dn)[k] ?? {};
  }

  /**
   * @see https://ajv.js.org/guide/modifying-data.html#assigning-defaults
   */
  getDefaultItem(dn: string): any {
    const ps = this.getOwnProperties(dn);
    const props: any = {};
    if (!isEmpty(ps)) {
      Object.entries(ps).forEach(([k, v]) => {
        const type = v.type as JSONType;
        // eslint-disable-next-line default-case
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
          // case 'null':
          //   props[k] = null;
          //   break;
        }
      });
    }
    return props;
  }
}
