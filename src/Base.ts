import { ValidateFunction } from 'ajv';
import { ValidationError } from '.';
import { Schema } from './schema';

export default class Base<T extends Schema> {
  public isPlural = true;

  constructor(
    public server: string,
    public api: string,
    public validate?: ValidateFunction<T>,
    public token?: string
  ) {
    if (server.endsWith('/')) this.server = server.substr(0, server.length - 1);
  }

  protected val(d: unknown): void {
    if (!this.validate) return;

    const valid = this.validate(d);
    if (valid) return;

    // console.log(this.validate.errors);
    const error =
      this.validate.errors && this.validate.errors.length ? this.validate.errors[0] : null;
    throw error
      ? new ValidationError(
          error.message ?? 'Validation Error',
          error.keyword === 'required' ? error.params.missingProperty : error.instancePath.substr(1)
        )
      : new Error('Unknown validation error');
  }
}
