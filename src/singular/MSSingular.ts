import axios from 'axios';
import UrlBuilder from '../UrlBuilder';
import { KVO, SingularSchema } from '..';
import Singular from './Singular';

export default class MSSingular<T extends SingularSchema> extends Singular<T> {
  public async one(): Promise<T & KVO> {
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.get(url);

    return res.data;
  }

  public async update(data: T & KVO, override?: boolean): Promise<T & KVO> {
    this.val(data);
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await (override ? axios.put(url, data) : axios.patch(url, data));

    return res.data;
  }
}
