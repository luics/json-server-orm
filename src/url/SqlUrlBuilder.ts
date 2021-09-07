import { Order } from '..';

const enc = encodeURIComponent;

export default class SqlUrlBuilder {
  private params: string[] = [];

  constructor(public base: string, public apiName: string, public token?: string) {
    if (this.base === undefined) throw new Error('url base is empty');
    if (!this.base.endsWith('/')) this.base += '/';
    if (this.token) this.p('_token', this.token);
  }

  toString(): string {
    const url = `${this.base}query?sql=${enc(`SELECT * FROM ${this.apiName}`)}`;
    console.log('[SqlUrlBuilder.toString]', url);
    return url;
    // return this.base + this.apiName + (this.params.length ? `?${this.params.join('&')}` : '');
  }

  p(name: string, v?: unknown): SqlUrlBuilder {
    if (name === '') throw new Error('name is empty');
    if (v === undefined) return this;

    let val;
    if (typeof v === 'object' && v !== null && 'toString' in v) val = v.toString();
    else if (typeof v === 'symbol') val = v.description;
    else val = `${v}`;

    this.params.push(`${enc(name)}=${enc(val ?? '')}`);
    return this;
  }

  id(v?: number): SqlUrlBuilder {
    return this.p('id', v);
  }

  page(v?: number): SqlUrlBuilder {
    return this.p('_page', v);
  }

  limit(v?: number): SqlUrlBuilder {
    return this.p('_limit', v);
  }

  sort(v?: string): SqlUrlBuilder {
    return this.p('_sort', v);
  }

  order(v?: Order): SqlUrlBuilder {
    return this.p('_order', v);
  }

  start(v?: number): SqlUrlBuilder {
    return this.p('_start', v);
  }

  end(v?: number): SqlUrlBuilder {
    return this.p('_end', v);
  }

  gte(name: string, v?: number): SqlUrlBuilder {
    return this.p(`${name}_gte`, v);
  }

  lte(name: string, v?: number): SqlUrlBuilder {
    return this.p(`${name}_lte`, v);
  }

  ne(name: string, v?: number): SqlUrlBuilder {
    return this.p(`${name}_ne`, v);
  }

  like(name: string, v?: unknown): SqlUrlBuilder {
    return this.p(`${name}_like`, v);
  }

  q(v?: unknown): SqlUrlBuilder {
    return this.p('q', v);
  }

  expand(v?: string): SqlUrlBuilder {
    return this.p('_expand', v);
  }

  embed(v?: string): SqlUrlBuilder {
    return this.p('_embed', v);
  }
}
