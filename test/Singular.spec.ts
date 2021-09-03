import 'mocha';
import { ok, rejects, strictEqual } from 'assert';
import Server from '@luics/json-server-simple';
import { Singular } from '../src';
import dbJson from './server/db.json';
import { Profile } from './server/schema';
import { validation } from './server/validation';

const port = 31989;
const s = `http://localhost:${port}/api/`;
const db = {
  profile: new Singular<Profile>(s, 'profile', validation.profile),
};
const server = new Server();

describe('Singular', () => {
  before(async () =>
    server.start({
      watch: dbJson,
      port,
      schema: undefined,
      level: undefined,
      staticDir: undefined,
      isProduction: false,
      token: undefined,
    })
  );

  after(async () => server.close());

  it('init', async () => {
    ok(db);
    ok(db.profile);
  });

  it('db.profile.one()', async () => {
    ok(await db.profile.one());
    strictEqual((await db.profile.one()).name, "luics's blog");
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
    rejects(async () => db.profile.update({ name1: '1234' } as any)); // ValidationError
    rejects(async () => db.profile.update({ name: '1234' })); // ValidationError
  });
});
