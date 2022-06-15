import { Order, V } from '.';

export class UrlBuilder {
  private params: string[] = [];

  constructor(public base: string, public apiName: string, public token?: string) {
    if (!this.base) throw new Error('url base is empty');
    if (!this.base.endsWith('/')) this.base += '/';
    if (this.token) this.p('_token', this.token);
  }

  toString(): string {
    return this.base + this.apiName + (this.params.length ? `?${this.params.join('&')}` : '');
  }

  p(n: string, v?: V): UrlBuilder {
    if (n === '') throw new Error('name is empty');
    if (v === undefined) return this;

    this.params.push(`${encodeURIComponent(n)}=${encodeURIComponent(`${v}`)}`);
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

  gte(name: string, v?: V): UrlBuilder {
    return this.p(`${name}_gte`, v);
  }

  lte(name: string, v?: V): UrlBuilder {
    return this.p(`${name}_lte`, v);
  }

  ne(name: string, v?: V): UrlBuilder {
    return this.p(`${name}_ne`, v);
  }

  like(name: string, v?: V): UrlBuilder {
    return this.p(`${name}_like`, v);
  }

  q(v?: V): UrlBuilder {
    return this.p('q', v);
  }

  embed(v?: string): UrlBuilder {
    return this.p('_embed', v);
  }

  expand(v?: string): UrlBuilder {
    return this.p('_expand', v);
  }

  contain(v?: string): UrlBuilder {
    return this.p('_contain', v);
  }

  avg(v?: string): UrlBuilder {
    return this.p('_avg', v);
  }

  count(v?: string): UrlBuilder {
    return this.p('_count', v);
  }

  max(v?: string): UrlBuilder {
    return this.p('_max', v);
  }

  min(v?: string): UrlBuilder {
    return this.p('_min', v);
  }

  sum(v?: string): UrlBuilder {
    return this.p('_sum', v);
  }

  std(v?: string): UrlBuilder {
    return this.p('_std', v);
  }
}
