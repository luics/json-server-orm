import 'mocha';
import { strictEqual } from 'assert';
import Validation from '../src/Validation';

describe('Validation', () => {
  it('key2DefinitionName', () => {
    strictEqual('Post', Validation.key2DefinitionName('post'));
  });

  it('table2DefinitionName', () => {
    strictEqual('Post', Validation.table2DefinitionName('posts'));
  });
});
