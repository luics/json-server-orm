import axios from 'axios';
import { arr, Plural, UrlBuilder, QueryOptions, PluralSchema, entries, keys, Validation } from '.';

const { tn2dn } = Validation;

export default class JSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const url = this.getUrl(opts).limit(opts?.limit ?? 1);
    const res = await axios.head(url.toString());
    return parseInt(res.headers['x-total-count'] ?? '0', 10);
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    const url = this.getUrl(opts);
    const res = await axios.get(url.toString());

    const rows: T[] = res.data;
    // Default values
    rows.forEach((row: any) => {
      const ps = this.v.getOwnProperties(tn2dn(this.tn));
      keys(ps).forEach((p) => {
        if (!(p in row)) {
          const { type } = this.v.getProperty(tn2dn(this.tn), p);
          if (type === 'string') row[p] = '';
          else if (type === 'array') row[p] = [];
          else if (type === 'object') row[p] = {};
        }
      });
    });

    return rows;
  }

  public async add(data: unknown): Promise<T> {
    data = this.val({ ...(data as any), id: 0 }) as T;
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.post(url, data);

    return res.data;
  }

  public async update(data: T): Promise<T> {
    data = this.val({ ...data }) as T;
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
