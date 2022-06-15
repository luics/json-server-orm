import axios from 'axios';
import { Plural, QueryOptions, UrlBuilder } from './x-server-orm/src';

export class JSPlural<T> extends Plural<T> {
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
    // rows.forEach((row: any) => {
    //   const ps = this.v.getOwnProperties(tn2dn(this.tn));
    //   keys(ps).forEach((p) => {
    //     if (!(p in row)) {
    //       const { type } = this.v.getProperty(tn2dn(this.tn), p);
    //       if (type === 'string') row[p] = '';
    //       else if (type === 'array') row[p] = [];
    //       else if (type === 'object') row[p] = {};
    //     }
    //   });
    // });

    return rows;
  }

  public async add(data: Partial<T>): Promise<T> {
    data = this.val({ ...(data as any), id: 0 }) as T;
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.post(url, data);

    return res.data;
  }

  public async update(data: Partial<T>): Promise<T> {
    const newData = this.val({ ...data }) as Partial<T> & { id: number };
    const url = new UrlBuilder(this.server, `${this.api}/${newData.id}`, this.token).toString();
    const res = await axios.patch(url, data);

    return res.data;
  }

  public async delete(id: number): Promise<void> {
    const url = new UrlBuilder(this.server, `${this.api}/${id}`, this.token).toString();
    await axios.delete(url);
  }
}
