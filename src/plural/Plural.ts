import { QueryOptions, PluralSchema, Validation } from '..';
import Base from '../Base';

export default abstract class Plural<T extends PluralSchema> extends Base<T> {
  constructor(
    public server: string,
    public api: string,
    public v: Validation,
    public token?: string
  ) {
    super(server, api, v, token);

    this.validate = v.validation[Validation.tn2dn(api)];
    // console.log('[dn]', Validation.tn2dn(api), this.validate);
  }

  public abstract count(opts?: QueryOptions): Promise<number>;

  public abstract all(opts?: QueryOptions): Promise<T[]>;

  public abstract one(id: number): Promise<T | undefined>;

  public abstract add(data: unknown): Promise<T>;

  public abstract update(data: T): Promise<T>;

  public abstract delete(id: number): Promise<void>;

  // protected abstract getUrl(opts?: QueryOptions): UrlBuilder;
}
