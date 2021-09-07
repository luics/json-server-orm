import http from 'http';
import { ok, rejects, strictEqual } from 'assert';
import 'mocha';
import getJsonServerApp from '@luics/json-server-simple';
import { getMysqlServerApp } from '@luics/mysql-server';
import { Singular, JSSingular, MSSingular } from '../src';
import dbJson from './server/db.json';
import { Profile } from './server/schema';
import { validation } from './server/validation';
import config from '../local.config.json';

const my = process.argv.includes('--mysql-server');

const port = 31989;
const s = `http://localhost:${port}/api/`;
const app = my
  ? getMysqlServerApp({ mysqlConfig: config.mysql })
  : getJsonServerApp({ watch: dbJson });
const db: { profile: Singular<Profile> } = {
  profile: my
    ? new MSSingular<Profile>(s, 'profile', validation.profile)
    : new JSSingular<Profile>(s, 'profile', validation.profile),
};
let server: http.Server;

describe(`Singular [${my ? 'mysql-server' : 'json-server'}]`, () => {
  before((done) => {
    server = http.createServer(app);
    server.listen(port, done);
  });

  after(() => server && server.close());

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
