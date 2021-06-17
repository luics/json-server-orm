import axios from 'axios';
import { Base } from './Base';
import { UrlBuilder } from './UrlBuilder';
import { KVO, SingularSchema } from '.';

export class Singular<T extends SingularSchema> extends Base<T> {

  public async one(): Promise<T & KVO> {
    try {
      const url = new UrlBuilder(this.server, this.api, this.token).toString();
      const res = await axios.get(url);

      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async update(data: T & KVO, override?: boolean): Promise<T & KVO> {
    try {
      this.val(data);
      const url = new UrlBuilder(this.server, this.api, this.token).toString();
      const res = await (override ? axios.put(url, data) : axios.patch(url, data));

      return res.data;
    } catch (error) {
      throw error;
    }
  }

}