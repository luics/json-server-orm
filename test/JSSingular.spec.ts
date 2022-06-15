import http from 'http';
import 'mocha';
import getJsonServerApp from '@luics/json-server-simple';
import { Validation } from '@luics/x-server-orm';
import { Profile, SingularSpecs } from '@luics/x-server-orm/cjs/test';
import dbJson from '@luics/x-server-orm/cjs/test/db.json';
import schemaJson from '@luics/x-server-orm/cjs/test/schema.json';
import { JSSingular } from '../src';

const port = 31989 + Math.floor(Math.random() * 10000);
const s = `http://localhost:${port}/api`;
const app = getJsonServerApp({ watch: dbJson, schema: schemaJson });
const v = new Validation(schemaJson);
const db = {
};

describe(`Singular`, () => {
  let server: http.Server;

  before((done) => {
    server = http.createServer(app);
    server.listen(port, done);
  });

  after(async () => {
    if (!server) return;
    server.close();
  });

});
