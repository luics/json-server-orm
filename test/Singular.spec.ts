import 'mocha';
import { ok, rejects, strictEqual } from 'assert';
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

  it('db.profile.update()', async () => {
    strictEqual((await db.profile.update({ name: 'luics' }))?.name, 'luics');
    strictEqual((await db.profile.update({ name: 'luics', desc: '123' }))?.desc, '123');
    strictEqual((await db.profile.update({ name: 'luics', age: 1 }))?.age, 1);
    strictEqual((await db.profile.one()).age, 1);
  });

  it('db.profile.update() +override', async () => {
    strictEqual((await db.profile.update({ name: 'luics' }, true))?.desc, undefined);
  });

  it('db.profile.update() +validation', async () => {
    rejects(async () => await db.profile.update({ name1: '1234' } as any)); // ValidationError
    rejects(async () => await db.profile.update({ name: '1234' })); // ValidationError
  });

});
