import 'mocha';
import { ok, strictEqual, throws } from 'assert';
import { UrlBuilder as Builder } from '../src/UrlBuilder';


const s = 'http://test.com/api/';
const t = '123';
const api = 'post';
const p = `${s}${api}?_token=${t}`;

describe('UrlBuilder', () => {
  let url: Builder;

  it('init', () => {
    url = new Builder(s, '', t);
    ok(url);
    strictEqual(url.toString(), `${s}?_token=${t}`);

    url = new Builder(s, api);
    strictEqual(url.toString(), `${s}${api}`);
  });

  it('param()', () => {
    strictEqual(new Builder(s, api, t).p('a', '0').toString(), `${p}&a=0`);
    strictEqual(new Builder(s, api, t).p('a', 0).toString(), `${p}&a=0`);
    strictEqual(new Builder(s, api, t).p('a', 1).toString(), `${p}&a=1`);
    strictEqual(new Builder(s, api, t).p('a', false).toString(), `${p}&a=false`);
    strictEqual(new Builder(s, api, t).p('a', true).toString(), `${p}&a=true`);
    strictEqual(new Builder(s, api, t).p('a', BigInt(0)).toString(), `${p}&a=0`);
    strictEqual(new Builder(s, api, t).p('a', Symbol(0)).toString(), `${p}&a=0`);
    strictEqual(new Builder(s, api, t).p('a', null).toString(), `${p}&a=null`);
    strictEqual(new Builder(s, api, t).p('a', undefined).toString(), `${p}`);
    strictEqual(new Builder(s, api, t).p('a').toString(), `${p}`);
    /// Exception
    throws(() => new Builder(s, api, t).p('', '0').toString());
    throws(() => new Builder(s, api, t).p('').toString());
  });

  it('expand()', () => {
    strictEqual(new Builder(s, api, t).expand('user').toString(), `${p}&_expand=user`);
    strictEqual(new Builder(s, api, t).expand('user').expand('tag').toString(), `${p}&_expand=user&_expand=tag`);
    strictEqual(new Builder(s, api, t).expand().toString(), `${p}`);
    strictEqual(new Builder(s, api, t).expand(undefined).toString(), `${p}`);
  });

  it('page()', () => {
    strictEqual(new Builder(s, api, t).page(0).toString(), `${p}&_page=0`);
    strictEqual(new Builder(s, api, t).page(1).toString(), `${p}&_page=1`);
  });

  it('limit()', () => {
    strictEqual(new Builder(s, api, t).limit(10).toString(), `${p}&_limit=10`);
    strictEqual(new Builder(s, api, t).limit(5).toString(), `${p}&_limit=5`);
  });

  it('sort/order()', () => {
    strictEqual(new Builder(s, api, t).sort('id').toString(), `${p}&_sort=id`);
  });

  it('start/end()', () => {
    strictEqual(new Builder(s, api, t).start(1).end(3).toString(), `${p}&_start=1&_end=3`);
  });

  it('gte/lte/ne()', () => {
    strictEqual(new Builder(s, api, t).gte('id', 1).lte('id', 3).toString(), `${p}&id_gte=1&id_lte=3`);
    strictEqual(new Builder(s, api, t).ne('id', 1).toString(), `${p}&id_ne=1`);
  });

  it('like()', () => {
    strictEqual(new Builder(s, api, t).like('title', 'some').toString(), `${p}&title_like=some`);
  });

  it('q()', () => {
    strictEqual(new Builder(s, api, t).q('some').toString(), `${p}&q=some`);
  });

  it('group cases', () => {
    strictEqual(new Builder(s, api, t).page(3).limit(5).toString(), `${p}&_page=3&_limit=5`);
  });

});