import http from 'http';
import { ok, rejects, strictEqual } from 'assert';
import 'mocha';
import getJsonServerApp from '@luics/json-server-simple';
import { getMysqlServerApp } from '@luics/mysql-server';
import { Singular } from '../src';
import dbJson from './server/db.json';
import { Profile } from './server/schema';
import { validation } from './server/validation';
import config from '../local.config.json';

const { mysql: mysqlConfig } = config;
const port = 31989;
const s = `http://localhost:${port}/api/`;
const isMysqlServer = false;
const db = {
  profile: new Singular<Profile>(s, 'profile', validation.profile, '', isMysqlServer),
};
let app: any;
let server: http.Server;
if (!isMysqlServer) {
  app = getJsonServerApp({ watch: dbJson });
} else {
  app = getMysqlServerApp({ mysqlConfig });
}

describe('Singular', () => {
  before((done) => {
    server = http.createServer(app);
    server.listen(port, done);
  });

  after(() => {
    if (server) server.close();
  });

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
