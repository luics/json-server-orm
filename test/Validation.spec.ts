import 'mocha';
import { strictEqual } from 'assert';
import { Validation } from '../src/Validation';
import schema from './server/schema.json';

const v = new Validation(schema);

describe('validation', () => {
  it('getDefinitionNameFromKey', () => {
    strictEqual('Post', v.key2DefinitionName('post'));
  });

  it('getDefinitionNameFromTable', () => {
    strictEqual('Post', v.table2DefinitionName('posts'));
  });
});