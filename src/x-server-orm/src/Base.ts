/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ValidationError } from './util';

export class Base<T> {
  public isPlural = true;

  public api: string;

  get tn(): string {
    return this.api;
  }

  constructor(public entityClass: Function, public server: string, public token?: string) {
    // console.log('isPlural', this.isPlural, entityClass.name);
    this.api = `${entityClass.name.toLowerCase()}s`;
    if (server.endsWith('/')) this.server = server.substr(0, server.length - 1);
  }

  protected val(d: Partial<T>): Partial<T> {
    const data = plainToInstance(this.entityClass as any, d) as unknown as Partial<T>;
    // console.log('[typeorm-server-orm] [plainToInstance]', data);

    // const validatorOptions: ValidatorOptions = { whitelist: true, forbidNonWhitelisted: true };
    const errors = validateSync(data as any);
    if (errors.length) {
      console.error('[typeorm-server-orm]', errors);
      throw new ValidationError('class-validator Validation Error', errors);
    }
    return data;
  }
}
