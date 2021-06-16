import { ValidateFunction } from 'ajv';
import { ValidationError } from '.';
import { Schema } from './schema';

export class Base<T extends Schema> {
  constructor(
    public server: string,
    public api: string,
    public validate?: ValidateFunction<T>,
    public token?: string,
  ) {
  }

  protected val(d: any) {
    if (!this.validate) return;

    const valid = this.validate(d);
    if (valid) return;

    const error = (this.validate.errors && this.validate.errors.length) ? this.validate.errors[0] : null;
    throw error ? new ValidationError(error.message!, error.instancePath.substr(1)) : new Error('Unknown validation error');
  }
}