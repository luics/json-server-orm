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
  isArray,
  Validation,
} from '..';
import { isN } from '../util';

const { on2tn, tn2on } = Validation;

// const enc = encodeURIComponent;
const { keys, values, entries } = Object;

export default class MSPlural<T extends PluralSchema> extends Plural<T> {
  public async count(opts?: QueryOptions): Promise<number> {
    const sql = this.getSql(false, opts ?? {});
    const res = await this.fetch(sql);

    return res.data[0].count;
  }

  public async all(opts?: QueryOptions): Promise<T[]> {
    const { api: tn } = this;
    const sql = this.getSql(true, opts ?? {});
    const res = await this.fetch(sql);
    const { data } = res;

    const hasExpand = !isEmpty(opts?.expand);
    const hasEmbed = !isEmpty(opts?.embed);

    if (hasExpand) {
      const mainRows = data[0];
      opts?.expand?.forEach((on, i) => {
        const eRows = data[3 * (i + 1)];
        if (!isArray(eRows) || !eRows.length) return;

        const onid = `${on}Id`;
        mainRows.forEach((mainRow: any) => {
          mainRow[on] = eRows.find((o) => mainRow[onid] === o.id) ?? null;
        });
      });
    }

    if (hasEmbed) {
      let base = 0;
      if (opts?.expand?.length) base += opts.expand.length * 3;

      // console.log(data);
      const mainRows = data[0];
      opts?.embed?.forEach((etn, i) => {
        const eRows = data[base + 3 * (i + 1)];
        if (!isArray(eRows) || !eRows.length) return;

        const tnid = `${tn2on(tn)}Id`;
        mainRows.forEach((mainRow: any) => {
          mainRow[etn] = eRows.filter((o) => mainRow.id === o[tnid]);
        });
      });
    }

    return hasExpand || hasEmbed ? data[0] : data;
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
    const res = await this.fetch(sql);
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
    const res = await this.fetch(sql);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return data;
  }

  public async delete(id: number): Promise<void> {
    const sql = `DELETE FROM \`${this.api}\` WHERE id='${id}'`;
    const res = await this.fetch(sql);
    if (res.data.affectedRows !== 1) throw new Error(`Failed: ${sql}`);

    return res.data;
  }

  private async fetch(sql: string) {
    const url = new UrlBuilder(this.server, 'query', this.token).toString();
    return axios.get(url, { data: sql, headers: { 'Content-Type': 'text/plain' } });
    // const url = new UrlBuilder(this.server, 'query', this.token).p('sql', sql).toString();
    // return axios.get(url);
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
    const { api: tn } = this;
    const sqls: string[] = [];

    //
    // SELECT & FROM
    //
    if (isSelect) {
      sqls.unshift(`SELECT \`${tn}\`.*`);
    } else {
      sqls.unshift(`SELECT COUNT(id) as \`count\``);
    }
    sqls.push(`FROM \`${tn}\``);

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
    // More(embed, expand)
    //
    const mainSql = `${sqls.join('\n')}`;
    const esqls = [`${mainSql};`];

    if (isSelect && !isEmpty(opts.expand)) {
      opts.expand?.forEach((on) => {
        const etn = on2tn(on);
        const eid = `${on}Id`;
        const rnd = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const tmptb = `tmp_${eid}_${rnd}`;

        esqls.push(`DROP TABLE IF EXISTS \`${tmptb}\`;`);
        esqls.push(`CREATE TEMPORARY TABLE \`${tmptb}\` \n${mainSql};`);
        esqls.push(
          `SELECT * FROM \`${etn}\` WHERE \`id\` IN (SELECT DISTINCT \`${eid}\` FROM \`${tmptb}\`);`
        );
      });
    }

    if (isSelect && !isEmpty(opts.embed)) {
      opts.embed?.forEach((etn) => {
        const tnid = `${tn2on(tn)}Id`;
        const etnid = `${tn2on(etn)}Id`;
        const rnd = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const tmptb = `tmp_${etnid}_${rnd}`;

        esqls.push(`DROP TABLE IF EXISTS \`${tmptb}\`;`);
        esqls.push(`CREATE TEMPORARY TABLE \`${tmptb}\` \n${mainSql};`);
        esqls.push(
          `SELECT * FROM \`${etn}\` WHERE \`${tnid}\` IN (SELECT DISTINCT \`id\` FROM \`${tmptb}\`);`
        );
      });
    }

    //
    // return
    //
    const sql = esqls.join('\n');
    console.log(`>>>\n${sql}\n<<<`);
    return sql;
  }
}
