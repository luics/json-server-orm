import 'mocha';
import { strictEqual } from 'assert';
import { Validation } from '../src/Validation';
import schema from './server/schema.json';

const v = new Validation(schema);

describe('Validation', () => {
  it('key2DefinitionName', () => {
    strictEqual('Post', v.key2DefinitionName('post'));
  });

  it('table2DefinitionName', () => {
    strictEqual('Post', v.table2DefinitionName('posts'));
  });
});