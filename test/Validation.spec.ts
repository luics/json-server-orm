import 'mocha';
import { strictEqual } from 'assert';
import Validation from '../src/Validation';

describe('Validation', () => {
  it('key2dn', () => {
    strictEqual('Post', Validation.key2dn('post'));
  });

  it('tn2dn', () => {
    strictEqual('Post', Validation.tn2dn('posts'));
  });
});
