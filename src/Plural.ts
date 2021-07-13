import axios from 'axios';
import { Base } from './Base';
import { UrlBuilder } from './UrlBuilder';
import { QueryOptions } from './QueryOptions';
import { PluralSchema } from '.';

export class Plural<T extends PluralSchema> extends Base<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    try {
      const url = this.getUrl(opts)
        .limit(opts?.limit ?? 1);
      const res = (await axios.head(url.toString()));
      return parseInt(res.headers['x-total-count'] ?? '0', 10);
    } catch (error) {
      throw error;
    }
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    try {
      const url = this.getUrl(opts);
      const res = (await axios.get(url.toString()));
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async one(id: number): Promise<T | undefined> {
    const items = await this.all({ ids: [id] });
    if (items.length) return items[0];
  }

  public async add(data: any): Promise<T> {
    try {
      this.val({ ...data, id: 0 });
      const url = new UrlBuilder(this.server, this.api, this.token).toString();
      const res = (await axios.post(url, data));

      return res.data;
    } catch (error) {
      // console.error(error.message, error.response ?? '');
      throw error;
    }
  }

  public async update(data: T): Promise<T> {
    try {
      this.val(data);
      const url = new UrlBuilder(this.server, `${this.api}/${data.id}`, this.token).toString();
      const res = (await axios.patch(url, data));

      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      const url = new UrlBuilder(this.server, `${this.api}/${id}`, this.token).toString();
      await axios.delete(url);
    } catch (error) {
      throw error;
    }
  }

  private getUrl(opts?: QueryOptions): UrlBuilder {
    const url = new UrlBuilder(this.server, this.api, this.token)
      .limit(opts?.limit)
      .page(opts?.page)
      .sort(opts?.sort)
      .order(opts?.order)
      .start(opts?.start)
      .end(opts?.end)
      .q(opts?.q);
    if (opts?.ids) opts.ids.forEach((id) => url.id(id));
    if (opts?.gte) opts.gte.forEach((it) => url.gte(it.name, it.value));
    if (opts?.lte) opts.lte.forEach((it) => url.lte(it.name, it.value));
    if (opts?.ne) opts.ne.forEach((it) => url.ne(it.name, it.value));
    if (opts?.like) opts.like.forEach((it) => url.like(it.name, it.value));
    if (opts?.embed) opts.embed.forEach((it) => url.embed(it));
    if (opts?.expand) opts.expand.forEach((it) => url.expand(it));
    if (opts?.param) {
      const { param } = opts;
      if (Array.isArray(param)) param.forEach((it) => url.p(it.name, it.value));
      else Object.entries(param).forEach(([name, value]) => url.p(name, value));
    }

    return url;
  }
}
