/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { esc } from '@luics/mysql-server';
import { KVO, V, Plural, QueryOptions, PluralSchema, isA, MSPlural, isEmpty } from '..';
import { isN } from '../util';

const enc = encodeURIComponent;
const { keys, values, entries } = Object;

export default class JSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const sql = `SELECT COUNT(id) as \`count\` FROM \`${this.api}\` ${
      opts ? JSPlural.getSql(opts) : ''
    }`;
    console.log(sql);
    // const url = `${this.server}/query?sql=${enc(sql)}`;
    // const res = await axios.get(url);
    const res = await axios.get(`${this.server}/query`, {
      data: sql,
      headers: { 'content-type': 'text/plain' },
    });

    return res.data[0].count;
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    const sql = `SELECT * FROM \`${this.api}\` ${opts ? JSPlural.getSql(opts) : ''}`;
    console.log(sql);
    // FIXME esc %
    // const url = `${this.server}/query?sql=${enc(sql)}`;
    // const res = await axios.get(url);
    const res = await axios.get(`${this.server}/query`, {
      data: sql,
      headers: { 'content-type': 'text/plain' },
    });
    // console.log(res.data);

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

    return { ...data, id: res.data.insertId };
  }

  public async update(data: T): Promise<T> {
    this.val(data);

    const ent = entries(data);
    ent.splice(
      ent.findIndex(([k]) => k === 'id'),
      1
    );
    const sets = ent.map(([k, v]) => (k === 'id' ? '' : `\`${k}\`='${esc(`${v}`)}'`)).join(', ');
    const sql = `UPDATE \`${this.api}\` SET ${sets} WHERE id='${data.id}'`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return data;
  }

  public async delete(id: number): Promise<void> {
    const sql = `DELETE FROM \`${this.api}\` WHERE id='${id}'`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return res.data;
  }

  static build(p: KVO, op = (n: string, v: V) => `\`${n}\`='${esc(`${v}`)}'`, rel = 'OR'): string {
    const s: string[] = [];
    entries(p).forEach(([n, v]) => {
      if (isA(v)) {
        const ps = v.map((v1) => op(n, v1));
        if (ps.length) s.push(`(${ps.join(` ${rel} `)})`);
      } else {
        s.push(`(${op(n, v)})`);
      }
    });

    return s.join(' AND ');
  }

  /**
   * @see https://gist.github.com/bradtraversy/c831baaad44343cc945e76c2e30927b3
   */
  static getSql(opts: QueryOptions): string {
    const { build } = MSPlural;
    const sqls: string[] = [];
    //
    // WHERE(param, like, q, ids, gte, lte, ne)
    //
    const where: string[] = [];
    if (opts.param && !isEmpty(opts.param)) where.push(build(opts.param));
    // TODO full-text search https://dev.mysql.com/doc/refman/8.0/en/fulltext-natural-language.html
    // .q(opts.q);
    if (opts.like && !isEmpty(opts.like))
      where.push(build(opts.like, (n, v) => `\`${n}\` LIKE '%${esc(`${v}`)}%'`));
    if (opts.ids?.length) where.push(build({ id: opts.ids }));
    if (opts.gte && !isEmpty(opts.gte)) where.push(build(opts.gte, (n, v) => `\`${n}\` >= ${v}`));
    if (opts.lte && !isEmpty(opts.lte)) where.push(build(opts.lte, (n, v) => `\`${n}\` <= ${v}`));
    if (opts.ne && !isEmpty(opts.ne))
      where.push(build(opts.ne, (n, v) => `\`${n}\` != ${v}`, 'AND'));

    if (where.length) sqls.push(`WHERE ${where.join(' AND ')}`);

    //
    // ORDER BY(sort, order)
    //
    const order = opts.order?.toUpperCase() ?? 'ASC';
    if (opts.sort) {
      sqls.push(`ORDER BY \`${opts.sort}\` ${order}`);
    }

    //
    // LIMIT(start, end, limit, page)
    //
    let offset = opts.start ?? 0;
    let rowCount = -1;
    if (isN(opts.limit)) rowCount = opts.limit;
    if (isN(opts.end)) rowCount = opts.end - offset;
    if (isN(opts.page) && opts.page >= 0) {
      rowCount = !isN(opts.limit) || opts.limit <= 0 ? 10 : opts.limit;
      const page = opts.page === 0 ? 1 : opts.page;
      offset = (page - 1) * rowCount;
    }

    if (rowCount >= 0) sqls.push(`LIMIT ${offset}, ${rowCount}`);

    //
    // Embed & Parent
    //
    // if (opts.embed) opts.embed.forEach((it) => url.embed(it));
    // if (opts.expand) opts.expand.forEach((it) => url.expand(it));

    return sqls.join(' ');
  }
}
