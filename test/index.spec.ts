import { ok, strictEqual } from 'assert';
import 'mocha';
import { ValidationError, QueryOptions } from '../src';
import { Base } from '../src/Base';
import { User } from '../src/test/entity/user.entity';

describe('Base', () => {
  it('server', () => strictEqual(new Base(User, 'http://a.com/api').server, 'http://a.com/api'));
  it('server/', () => strictEqual(new Base(User, 'http://a.com/api/').server, 'http://a.com/api'));
  it('tn', () => strictEqual(new Base(User, 'http://a.com/api').tn, 'users'));
  it('api', () => strictEqual(new Base(User, 'http://a.com/api').api, 'users'));
});

describe('ValidationError', () => {
  it('new ValidationError()', () => ok(new ValidationError('', [])));
});

describe('QueryOptions', () => {
  const opts: QueryOptions = {};
  it('QueryOptions', () => ok(opts));
});
