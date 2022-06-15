/* eslint-disable @typescript-eslint/ban-types */
import { KVO } from '.';
import { Base } from './Base';

export abstract class Singular<T> extends Base<T> {
  public isPlural = false;

  constructor(public entityClass: Function, public server: string, public token?: string) {
    super(entityClass, server, token);

    this.api = `${entityClass.name.toLowerCase()}`;
  }

  public abstract one(): Promise<T & KVO>;

  public abstract update(data: Partial<T> & KVO, override?: boolean): Promise<T & KVO>;
}
