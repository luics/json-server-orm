import axios from 'axios';
import { Base } from './Base';
import { UrlBuilder } from './UrlBuilder';
import { SingularSchema } from '.';

export class Singular<T extends SingularSchema> extends Base<T> {

  public async one(): Promise<T> {
    try {
      const url = new UrlBuilder(this.server, this.api, this.token).toString();
      const res = await axios.get(url);

      return res.data;
    } catch (error) {
      throw error;
    }
  }

  public async update(data: T & { [k: string]: any }): Promise<T> {
    try {
      this.val(data);
      const url = new UrlBuilder(this.server, this.api, this.token).toString();
      const res = (await axios.patch(url, data));

      return res.data;
    } catch (error) {
      throw error;
    }
  }

}