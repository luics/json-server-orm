import axios from 'axios';
import { Singular, KVO, SingularSchema } from '..';

const enc = encodeURIComponent;

export default class MSSingular<T extends SingularSchema> extends Singular<T> {
  public async one(): Promise<T & KVO> {
    const sql = `SELECT \`value\` FROM \`${this.api}\` LIMIT 1`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);

    return res.data[0].value;
  }

  public async update(data: T & KVO): Promise<T & KVO> {
    this.val(data);

    const sql = `UPDATE \`${this.api}\` SET \`value\`='${JSON.stringify(data)}'`;
    const url = `${this.server}/query?sql=${enc(sql)}`;
    const res = await axios.get(url);
    console.log(res.data);

    return data;
  }
}
