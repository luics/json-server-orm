import 'mocha';
import { ok, strictEqual } from 'assert';
import { Singular } from '../src';
import * as Server from './server/server';
import dbJson from './server/db.json';
import { Profile } from './server/schema';
import { validation } from './server/validation';

const port = 31989;
const server = `http://localhost:${port}/api/`;
const db = {
  profile: new Singular<Profile>(server, 'profile', validation.profile),
};

describe('Object(Singular)', () => {
  before(async () => Server.start(dbJson, port, false));

  after(async () => Server.close());

  it('init', async () => {
    ok(db);
    ok(db.profile);
  });

  it('db.profile.one()', async () => {
    ok((await db.profile.one()));
    strictEqual((await db.profile.one()).name, 'luics\'s blog');
  });

  it('db.posts.update()', async () => {
    strictEqual((await db.profile.update({ name: 'luics', desc: '' }))?.name, 'luics');
  });

});
