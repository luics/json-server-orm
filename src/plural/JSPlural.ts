import axios from 'axios';
import { arr, Plural, UrlBuilder, QueryOptions, PluralSchema, entries } from '..';

export default class JSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const url = this.getUrl(opts).limit(opts?.limit ?? 1);
    const res = await axios.head(url.toString());
    return parseInt(res.headers['x-total-count'] ?? '0', 10);
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    const url = this.getUrl(opts);
    const res = await axios.get(url.toString());
    return res.data;
  }

  public async one(id: number): Promise<T | undefined> {
    const items = await this.all({ ids: [id] });
    return items[0];
  }

  public async add(data: unknown): Promise<T> {
    this.val({ ...(data as any), id: 0 });
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.post(url, data);

    return res.data;
  }

  public async update(data: T): Promise<T> {
    this.val(data);
    const url = new UrlBuilder(this.server, `${this.api}/${data.id}`, this.token).toString();
    const res = await axios.patch(url, data);

    return res.data;
  }

  public async delete(id: number): Promise<void> {
    const url = new UrlBuilder(this.server, `${this.api}/${id}`, this.token).toString();
    await axios.delete(url);
  }

  protected getUrl(opts?: QueryOptions): UrlBuilder {
    const url = new UrlBuilder(this.server, this.api, this.token)
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
    if (opts?.param) entries(opts.param).forEach(([n, v]) => arr(v).forEach((v1) => url.p(n, v1)));

    return url;
  }
}
