import 'mocha';
import { strictEqual } from 'assert';
import Validation from '../src/Validation';

describe('Validation', () => {
  it('on2dn', () => {
    strictEqual('Post', Validation.on2dn('post'));
  });

  it('tn2dn', () => {
    strictEqual('Post', Validation.tn2dn('posts'));
  });
});
