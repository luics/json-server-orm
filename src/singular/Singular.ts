import Base from '../Base';
import { KVO, SingularSchema, Validation } from '..';

export default abstract class Singular<T extends SingularSchema> extends Base<T> {
  public isPlural = false;

  constructor(
    public server: string,
    public api: string,
    public v: Validation,
    public token?: string
  ) {
    super(server, api, v, token);

    this.validate = v.validation[Validation.on2dn(api)];
    // console.log('[dn]', Validation.key2dn(api), this.validate);
  }

  public abstract one(): Promise<T & KVO>;

  public abstract update(data: T & KVO, override?: boolean): Promise<T & KVO>;
}
