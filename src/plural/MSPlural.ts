/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { esc } from '@luics/mysql-server';
import { Plural, UrlBuilder, QueryOptions, PluralSchema } from '..';

const enc = encodeURIComponent;
const { keys, values, entries } = Object;

export default class JSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const url = this.getUrl(opts).limit(opts?.limit ?? 1);
    const res = await axios.head(url.toString());
    return parseInt(res.headers['x-total-count'] ?? '0', 10);
  }

  public async all(_opts?: QueryOptions): Promise<T[]> {
    // TODO opts
    // const url = this.getUrl(opts);
    // const res = await axios.get(url.toString());
    const sql = `SELECT * FROM \`${this.api}\``;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);

    return res.data;
  }

  public async one(id: number): Promise<T | undefined> {
    const items = await this.all({ ids: [id] });
    return items[0];
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async add(data: any): Promise<T> {
    this.val({ ...data, id: 0 });
    const k = keys(data)
      .map((o) => `\`${o}\``)
      .join(', ');
    const v = values(data)
      .map((o) => `'${esc(`${o}`)}'`)
      .join(', ');
    const sql = `INSERT INTO \`${this.api}\` (${k}) VALUES (${v})`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);
    console.log(res.data);

    return { ...data, id: res.data.insertId };
  }

  public async update(data: T): Promise<T> {
    this.val(data);

    const en = entries(data);
    en.splice(
      en.findIndex(([k]) => k === 'id'),
      1
    );
    const vv = en.map(([k, v]) => (k === 'id' ? '' : `\`${k}\`='${esc(`${v}`)}'`)).join(', ');
    const sql = `UPDATE \`${this.api}\` SET ${vv} WHERE id='${data.id}'`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    console.log(sql);
    console.log(res.data);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return data;
  }

  public async delete(id: number): Promise<void> {
    const sql = `DELETE FROM \`${this.api}\` WHERE id='${id}'`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);
    console.log(res.data);

    return res.data;
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
