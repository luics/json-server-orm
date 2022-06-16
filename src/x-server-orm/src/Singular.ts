/* eslint-disable @typescript-eslint/ban-types */
import axios from 'axios';
import { KVO, UrlBuilder } from '.';
import { Base } from './Base';

export abstract class Singular<T> extends Base<T> {
  public isPlural = false;

  constructor(public entityClass: Function, public server: string, public token?: string) {
    super(entityClass, server, token);

    this.api = `${entityClass.name.toLowerCase()}`;
  }

  public async one(): Promise<T & KVO> {
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.get(url);

    return res.data;
  }

  public async update(data: Partial<T> & KVO): Promise<T & KVO> {
    const newData = this.val({ ...data }) as Partial<T> & KVO;
    const url = new UrlBuilder(this.server, this.api, this.token).toString();
    const res = await axios.put(url, newData);

    return res.data;
  }
}
