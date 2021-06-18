import { ValidateFunction } from 'ajv';
import { ValidationError } from '.';
import { Schema } from './schema';

export class Base<T extends Schema> {
  
  public isPlural = true;

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

    // console.log(this.validate.errors);
    const error = (this.validate.errors && this.validate.errors.length) ? this.validate.errors[0] : null;
    throw error
      ? new ValidationError(error.message!, error.keyword === 'required' ? error.params.missingProperty : error.instancePath.substr(1))
      : new Error('Unknown validation error');
  }
}