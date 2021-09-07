import Base from '../Base';
import { KVO, SingularSchema } from '..';

export default abstract class Singular<T extends SingularSchema> extends Base<T> {
  public isPlural = false;

  public abstract one(): Promise<T & KVO>;

  public abstract update(data: T & KVO, override?: boolean): Promise<T & KVO>;
}
