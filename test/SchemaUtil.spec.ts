import 'mocha';
import { deepStrictEqual, ok } from 'assert';
import { SchemaUtil } from '../src';
import schema from './schema.json';

const su = SchemaUtil;

describe('SchemaUtil', () => {
  const u = new SchemaUtil(schema);

  it('init', () => {
    ok(u);
    deepStrictEqual(u.schema, schema);
  });

  it('isSingular', () => ok(u.isSingular('profile')));
  it('isSingular', () => ok(!u.isSingular('posts')));
  it('isPlural', () => ok(u.isPlural('posts')));
  it('isPlural', () => ok(!u.isPlural('profile')));
  it('isPluralOn', () => ok(u.isPluralOn('post')));
  it('isPluralOn', () => ok(!u.isPluralOn('posts')));
  it('isPluralOn', () => ok(!u.isPluralOn('post1')));

  it('on2dn', () => deepStrictEqual(su.on2dn('post'), 'Post'));
  it('on2tn', () => deepStrictEqual(su.on2tn('post'), 'posts'));
  it('dn2on', () => deepStrictEqual(su.dn2on('Post'), 'post'));
  it('dn2tn', () => deepStrictEqual(su.dn2tn('Post'), 'posts'));
  it('tn2dn', () => deepStrictEqual(su.tn2dn('posts'), 'Post'));
  it('tn2on', () => deepStrictEqual(su.tn2on('posts'), 'post'));

  it('isRequiredProperty', () => ok(u.isRequiredProperty('Post', 'title')));
  it('isRequiredProperty', () => ok(!u.isRequiredProperty('Post', 'content')));
  it('isRequiredProperty', () => ok(!u.isRequiredProperty('Post1', 'title')));

  it('getOwnFields', () => ok(u.getOwnFields('Post').length > 0));
  it('getOwnFields', () => ok(u.getOwnFields('Post1').length === 0));

  it('getOwnProperties', () => ok(Object.keys(u.getOwnProperties('Post')).length > 0));
  it('getOwnProperties', () => ok(Object.keys(u.getOwnProperties('Post1')).length === 0));

  it('getProperty', () => ok(u.getProperty('Post', 'title')));
  it('getProperty', () => deepStrictEqual(u.getProperty('Post1', 'title'), {}));

  it('getDefaultItem', () => ok(Object.keys(u.getDefaultItem('Post')).length > 0));
  it('getDefaultItem', () => ok(Object.keys(u.getDefaultItem('Testonly')).length > 0));
  it('getDefaultItem', () => ok(Object.keys(u.getDefaultItem('Post1')).length === 0));
});
