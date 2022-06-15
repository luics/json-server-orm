import { arr, entries, QueryOptions, UrlBuilder } from '.';
import { Base } from './Base';

export abstract class Plural<T> extends Base<T> {
  public abstract count(opts?: QueryOptions): Promise<number>;

  public abstract all(opts?: QueryOptions): Promise<T[]>;

  // public abstract one(id: number, opts?: QueryOptions): Promise<T | undefined>;
  public async one(id: number, opts?: QueryOptions): Promise<T | undefined> {
    const items = await this.all({ ...(opts ?? {}), ids: [id] });
    return items[0];
  }

  public abstract add(data: unknown): Promise<T>;

  public abstract update(data: Partial<T>): Promise<T>;

  public abstract delete(id: number): Promise<void>;

  protected getUrl(opts?: QueryOptions, api = this.api): UrlBuilder {
    const url = new UrlBuilder(this.server, api, this.token)
      .limit(opts?.limit)
      .page(opts?.page)
      .sort(opts?.sort)
      .order(opts?.order)
      .start(opts?.start)
      .end(opts?.end)
      .q(opts?.q);
    if (opts?.ids) opts.ids.forEach((id) => url.id(id));
    if (opts?.gte) entries(opts.gte).forEach(([n, v]) => arr(v).forEach((v1) => url.gte(n, v1)));
    if (opts?.lte) entries(opts.lte).forEach(([n, v]) => arr(v).forEach((v1) => url.lte(n, v1)));
    if (opts?.ne) entries(opts.ne).forEach(([n, v]) => arr(v).forEach((v1) => url.ne(n, v1)));
    if (opts?.like) entries(opts.like).forEach(([n, v]) => arr(v).forEach((v1) => url.like(n, v1)));
    if (opts?.embed) opts.embed.forEach((it) => url.embed(it));
    if (opts?.expand) opts.expand.forEach((it) => url.expand(it));
    if (opts?.contain) opts.contain.forEach((it) => url.contain(it));

    // if (opts?.avg) opts.avg.forEach((it) => url.avg(it));
    // if (opts?.count) opts.count.forEach((it) => url.count(it));
    // if (opts?.max) opts.max.forEach((it) => url.max(it));
    // if (opts?.min) opts.min.forEach((it) => url.min(it));
    // if (opts?.sum) opts.sum.forEach((it) => url.sum(it));
    // if (opts?.std) opts.std.forEach((it) => url.std(it));

    if (opts?.param) entries(opts.param).forEach(([n, v]) => arr(v).forEach((v1) => url.p(n, v1)));

    return url;
  }
}
