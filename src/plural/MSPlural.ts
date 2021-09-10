/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { esc } from '@luics/mysql-server';
import {
  KVO,
  V,
  Plural,
  QueryOptions,
  PluralSchema,
  isA,
  isEmpty,
  UrlBuilder,
  Validation,
} from '..';
import { isN } from '../util';

const { on2tn, on2dn } = Validation;

// const enc = encodeURIComponent;
const { keys, values, entries } = Object;

export default class MSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const sql = this.getSql(false, opts ?? {});
    const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
    const res = await axios.get(url);

    return res.data[0].count;
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    const sql = this.getSql(true, opts ?? {});
    const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
    const res = await axios.get(url);
    const { data } = res;
    if (!isEmpty(opts?.expand)) {
      opts?.expand?.forEach((on) => {
        const tn = on2tn(on);
        const fs = this.v.getOwnFields(on2dn(on));
        data.forEach((row: any) => {
          fs.forEach((f) => {
            const k = `${tn}__${f}`;
            if (k in row) {
              if (!row[on]) row[on] = {};
              row[on][f] = row[k];
              delete row[k];
            }
          });
        });
      });
    }

    if (!isEmpty(opts?.embed)) {
      // TODO embed data
    }

    return data;
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
    const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
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
    const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return data;
  }

  public async delete(id: number): Promise<void> {
    const sql = `DELETE FROM \`${this.api}\` WHERE id='${id}'`;
    const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
    const res = await axios.get(url);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return res.data;
  }

  private eqop = (n: string, v: V): string => `\`${this.api}\`.\`${n}\`='${esc(`${v}`)}'`;

  static build(conditions: KVO, op: (n: string, v: V) => string, logic = 'OR'): string {
    const s: string[] = [];
    entries(conditions).forEach(([n, v]) => {
      if (isA(v)) {
        const cs = v.map((v1) => op(n, v1));
        if (cs.length) s.push(`(${cs.join(` ${logic} `)})`);
      } else {
        s.push(`(${op(n, v)})`);
      }
    });

    return s.join(' AND ');
  }

  /**
   * @see https://gist.github.com/bradtraversy/c831baaad44343cc945e76c2e30927b3
   */
  private getSql(isSelect: boolean, opts: QueryOptions): string {
    const { build } = MSPlural;
    const { api: tn, v: val } = this;
    const sqls: string[] = [];

    let fields: string[] = [`\`${tn}\`.*`];
    //
    // JOIN(embed, expand)
    //
    const joins: string[] = [];
    if (isSelect) {
      opts.expand?.forEach((on) => {
        const tn1 = on2tn(on);
        const dn = on2dn(on);
        const fs = val.getOwnFields(dn);
        // SELECT posts.*, users.id AS users__id, users.name AS users__name, users.token AS users__token
        // FROM posts
        // LEFT JOIN users on users.id=posts.userId
        // LEFT JOIN `groups` on `groups`.id=posts.groupId
        // WHERE posts.userId=2
        fields = fields.concat(fs.map((o) => `\`${tn1}\`.\`${o}\` AS \`${tn1}__${o}\``));
        joins.push(`LEFT JOIN \`${tn1}\` ON \`${tn1}\`.\`id\`=\`${tn}\`.\`${on}Id\``);
        // console.log('[expand]', on, dn, tn1, fields);
      });

      // if (opts.embed) opts.embed.forEach((it) => url.embed(it));
    }

    //
    // SELECT
    //
    if (isSelect) {
      sqls.push(`SELECT ${fields.join(', ')} \nFROM \`${this.api}\``);
      joins.forEach((o) => sqls.push(o));
    } else {
      sqls.push(`SELECT COUNT(id) as \`count\` \nFROM \`${this.api}\``);
    }

    //
    // WHERE(param, like, q, ids, gte, lte, ne)
    //
    const where: string[] = [];
    if (opts.param && !isEmpty(opts.param)) where.push(build(opts.param, this.eqop));
    // TODO full-text search https://dev.mysql.com/doc/refman/8.0/en/fulltext-natural-language.html
    // .q(opts.q);
    if (opts.like && !isEmpty(opts.like))
      where.push(build(opts.like, (n, v) => `\`${tn}\`.\`${n}\` LIKE '%${esc(`${v}`)}%'`));
    if (opts.ids?.length) where.push(build({ id: opts.ids }, this.eqop));
    if (opts.gte && !isEmpty(opts.gte))
      where.push(build(opts.gte, (n, v) => `\`${tn}\`.\`${n}\` >= ${v}`));
    if (opts.lte && !isEmpty(opts.lte))
      where.push(build(opts.lte, (n, v) => `\`${tn}\`.\`${n}\` <= ${v}`));
    if (opts.ne && !isEmpty(opts.ne))
      where.push(build(opts.ne, (n, v) => `\`${tn}\`.\`${n}\` != ${v}`, 'AND'));

    if (where.length) sqls.push(`WHERE ${where.join(' AND ')}`);

    //
    // ORDER BY(sort, order)
    //
    const order = opts.order?.toUpperCase() ?? 'ASC';
    if (opts.sort) {
      sqls.push(`ORDER BY \`${tn}\`.\`${opts.sort}\` ${order}`);
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
    // return
    //
    const sql = sqls.join('\n');
    console.log(`>>>\n${sql}\n<<<`);
    return sql;
  }
}
