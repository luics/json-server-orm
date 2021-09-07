import { Order } from '..';

export default class UrlBuilder {
  private params: string[] = [];

  constructor(public base: string, public apiName: string, public token?: string) {
    if (this.base === undefined) throw new Error('url base is empty');
    if (!this.base.endsWith('/')) this.base += '/';
    if (this.token) this.p('_token', this.token);
  }

  toString(): string {
    return this.base + this.apiName + (this.params.length ? `?${this.params.join('&')}` : '');
  }

  p(name: string, v?: unknown): UrlBuilder {
    if (name === '') throw new Error('name is empty');
    if (v === undefined) return this;

    let val;
    if (typeof v === 'object' && v !== null && 'toString' in v) val = v.toString();
    else if (typeof v === 'symbol') val = v.description;
    else val = `${v}`;

    this.params.push(`${encodeURIComponent(name)}=${encodeURIComponent(val ?? '')}`);
    return this;
  }

  id(v?: number): UrlBuilder {
    return this.p('id', v);
  }

  page(v?: number): UrlBuilder {
    return this.p('_page', v);
  }

  limit(v?: number): UrlBuilder {
    return this.p('_limit', v);
  }

  sort(v?: string): UrlBuilder {
    return this.p('_sort', v);
  }

  order(v?: Order): UrlBuilder {
    return this.p('_order', v);
  }

  start(v?: number): UrlBuilder {
    return this.p('_start', v);
  }

  end(v?: number): UrlBuilder {
    return this.p('_end', v);
  }

  gte(name: string, v?: number): UrlBuilder {
    return this.p(`${name}_gte`, v);
  }

  lte(name: string, v?: number): UrlBuilder {
    return this.p(`${name}_lte`, v);
  }

  ne(name: string, v?: number): UrlBuilder {
    return this.p(`${name}_ne`, v);
  }

  like(name: string, v?: unknown): UrlBuilder {
    return this.p(`${name}_like`, v);
  }

  q(v?: unknown): UrlBuilder {
    return this.p('q', v);
  }

  expand(v?: string): UrlBuilder {
    return this.p('_expand', v);
  }

  embed(v?: string): UrlBuilder {
    return this.p('_embed', v);
  }
}

// export const isUrlBuilder = (arg?: any): arg is UrlBuilder => !!arg;
// Examples
// const url = 'http://localhost:3000/api/posts?_token=1989&_embed=comments&_embed=tags&_expand=user&userId=2';
