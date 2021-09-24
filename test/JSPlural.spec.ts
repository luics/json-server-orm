import http from 'http';
import 'mocha';
import getJsonServerApp from '@luics/json-server-simple';
import { Validation } from '@luics/x-server-orm';
import { User, Post, Comment, Product, PluralSpecs } from '@luics/x-server-orm/cjs/test';
import dbJson from '@luics/x-server-orm/cjs/test/db.json';
import schemaJson from '@luics/x-server-orm/cjs/test/schema.json';
import { JSPlural } from '../src';

const port = 31989 + Math.floor(Math.random() * 10000);
const s = `http://localhost:${port}/api`;
const app = getJsonServerApp({ watch: dbJson, level: 'access', schema: schemaJson });
const v = new Validation(schemaJson);
const db = {
  posts: new JSPlural<Post>(s, 'posts', v),
  comments: new JSPlural<Comment>(s, 'comments', v),
  users: new JSPlural<User>(s, 'users', v),
  products: new JSPlural<Product>(s, 'products', v),
};

describe(`Plural`, () => {
  let server: http.Server;

  before((done) => {
    server = http.createServer(app);
    server.listen(port, done);
  });

  after(async () => {
    if (!server) return;
    server.close();
  });

  PluralSpecs(db);
});
