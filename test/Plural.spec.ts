import fs from 'fs';
import path from 'path';
import http from 'http';
import { ok, deepStrictEqual, rejects } from 'assert';
import 'mocha';
import axios from 'axios';
import getJsonServerApp from '@luics/json-server-simple';
import { getMysqlServerApp } from '@luics/mysql-server';
import { JSPlural, MSPlural, Validation } from '../src';
import { User, Post, Comment } from './server/schema';
import dbJson from './server/db.json';
import schema from './server/schema.json';
import config from '../local.config.json';

const my = process.argv.includes('--mysql');

const port = 31989 + Math.floor(Math.random() * 10000);
const s = `http://localhost:${port}/api`;
const app = my
  ? getMysqlServerApp({ mysqlConfig: config.mysql, level: 'access' }) //
  : getJsonServerApp({ watch: dbJson, level: 'access', schema });
const v = new Validation(schema);
const db = {
  posts: my ? new MSPlural<Post>(s, 'posts', v) : new JSPlural<Post>(s, 'posts', v),
  comments: my ? new MSPlural<Comment>(s, 'comments', v) : new JSPlural<Comment>(s, 'comments', v),
  users: my ? new MSPlural<User>(s, 'users', v) : new JSPlural<User>(s, 'users', v),
};
const { comments: c, posts: p, users: u, groups: g } = dbJson;
const len = p.length;

describe(`Plural [${my ? 'mysql-server' : 'json-server'}]`, () => {
  let server: http.Server;

  before((done) => {
    server = http.createServer(app);
    server.listen(port, async () => {
      if (!my) return done();
      const sqls = [
        fs.readFileSync(path.resolve(__dirname, 'server/schema.sql')).toString(),
        fs.readFileSync(path.resolve(__dirname, 'server/db.sql')).toString(),
      ].join('\n');
      await axios.get(`${s}/execute`, {
        data: sqls,
        headers: { 'content-type': 'text/plain' },
      });
      return done();
    });
  });

  after(async () => {
    if (!server) return;
    if (my) await axios.get(`${s}/end`);
    server.close();
  });

  it('init', async () => {
    ok(db);
    ok(db.users);
  });

  it('db.posts.all()', async () => {
    ok((await db.posts.all()).length > 0);
    deepStrictEqual(await db.posts.all(), p);
  });

  it('db.posts.all({ expand })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [1] }), [p[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: [] }), [p[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: ['user'] }), [{ ...p[0], user: u[0] }]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: ['user', 'group'] }), [
      { ...p[0], user: u[0], group: g[0] },
    ]);
  });

  // it('db.posts.all({ embed })', async () => {
  //   deepStrictEqual((await db.posts.all({ ids: [1] }))[0].comments, undefined);
  //   deepStrictEqual((await db.posts.all({ ids: [1], embed: ['comments'] }))[0].comments?.length, 3);
  // });

  it('db.posts.all({ param })', async () => {
    deepStrictEqual(await db.posts.all({ param: {} }), p);
    deepStrictEqual(await db.posts.all({ param: { userId: 2 } }), [p[2], ...p.slice(5, 10)]);
    deepStrictEqual(await db.posts.all({ param: { userId: [1, 2] } }), p);
    deepStrictEqual(await db.posts.all({ param: { title: 'post from ab' } }), p.slice(10, 20));
    deepStrictEqual(await db.posts.all({ param: { title: 'post from ab', userId: 0 } }), []);
  });

  // it('db.posts.all({ q })', async () => {
  //   deepStrictEqual((await db.posts.all({ q: 'wer' })).length, 1);
  // });

  it('db.posts.all({ like })', async () => {
    deepStrictEqual(await db.posts.all({ like: { title: 'wer' } }), [p[3]]);
    deepStrictEqual((await db.posts.all({ like: { title: 'post' } })).length, 18);
  });

  it('db.posts.all({ ids })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [] }), p);
    deepStrictEqual(await db.posts.all({ ids: [1] }), [p[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1, 2] }), [p[0], p[1]]);
    deepStrictEqual(await db.posts.all({ ids: [1, 10000] }), [p[0]]);
  });

  it('db.posts.all({ gte, lte })', async () => {
    deepStrictEqual(await db.posts.all({ lte: { id: 3 } }), [p[0], p[1], p[2]]);
    deepStrictEqual(await db.posts.all({ gte: { id: 18 } }), [p[17], p[18], p[19]]);
    deepStrictEqual(await db.posts.all({ gte: { id: 2 }, lte: { id: 3 } }), [p[1], p[2]]);
  });

  it('db.posts.all({ ne })', async () => {
    deepStrictEqual((await db.posts.all({ ne: { id: 1 } })).length, len - 1);
    deepStrictEqual((await db.posts.all({ ne: { id: [1, 2] } })).length, len - 2);
    deepStrictEqual((await db.posts.all({ ne: { id: [1, 10000] } })).length, len - 1);
  });

  it('db.posts.all({ sort, order })', async () => {
    deepStrictEqual(await db.posts.all({ sort: 'id' }), p);
    deepStrictEqual(await db.posts.all({ sort: 'id', order: 'asc' }), p);
    deepStrictEqual(await db.posts.all({ sort: 'id', order: 'desc' }), [...p].reverse());
  });

  it('db.posts.all({ limit })', async () => {
    deepStrictEqual(await db.posts.all({ limit: 1 }), [p[0]]);
    deepStrictEqual(await db.posts.all({ limit: len }), p);
    // TODO deepStrictEqual((await db.posts.all({ limit: -1 })).length, len - 1);
    deepStrictEqual(await db.posts.all({ limit: len + 1 }), p);
  });

  it('db.posts.all({ page })', async () => {
    deepStrictEqual(await db.posts.all({ page: 0 }), p.slice(0, 10));
    deepStrictEqual(await db.posts.all({ page: 1 }), p.slice(0, 10));
    deepStrictEqual(await db.posts.all({ page: 1, limit: 5 }), p.slice(0, 5));
    deepStrictEqual(await db.posts.all({ page: 4, limit: 5 }), p.slice(15, 20));
  });

  it('db.posts.all({ start, end, limit })', async () => {
    deepStrictEqual(await db.posts.all({ start: 0, end: 1 }), [p[0]]);
    deepStrictEqual(await db.posts.all({ end: 1 }), [p[0]]);
    deepStrictEqual(await db.posts.all({ start: 0, end: 10 }), p.slice(0, 10));
    deepStrictEqual(await db.posts.all({ start: 0, limit: 5 }), p.slice(0, 5));
    deepStrictEqual(await db.posts.all({ start: 1, end: 1 }), []);
    deepStrictEqual(await db.posts.all({ start: 1, limit: 0 }), []);
  });

  it('db.posts.all({ page, start, end, limit })', async () => {
    deepStrictEqual(await db.posts.all({ page: 1, limit: 5, start: 10, end: 20 }), p.slice(0, 5));
    deepStrictEqual(await db.posts.all({ page: 1, start: 10, end: 20 }), p.slice(0, 10));
  });

  it('db.posts.one()', async () => {
    deepStrictEqual((await db.posts.one(1))?.id, 1);
    deepStrictEqual((await db.posts.one(0))?.id, undefined);
  });

  it('db.posts.add/delete()', async () => {
    deepStrictEqual(
      (await db.posts.add({ title: 'post from test', userId: 1, groupId: 1 }))?.id,
      len + 1
    );
    deepStrictEqual(
      (await db.posts.add({ title: 'post from test', userId: 1, groupId: 2 }))?.id,
      len + 2
    );
    await db.posts.delete(len + 2);
    await db.posts.delete(len + 1);
    deepStrictEqual((await db.posts.all()).length, len);
  });

  it('db.posts.add() +validation', async () => {
    rejects(async () => db.posts.add({ title: 'post from test' })); // ValidationError
    rejects(async () => db.posts.add({ title: 'post', userId: 1 }));
  });

  it('db.posts.update()', async () => {
    deepStrictEqual(
      (await db.posts.update({ id: 1, title: '12345', userId: 1, groupId: 1 }))?.title,
      '12345'
    );
    deepStrictEqual(
      (await db.posts.update({ id: 1, title: '12345', userId: 2, groupId: 1 }))?.userId,
      2
    );
  });

  it('db.posts.count()', async () => {
    deepStrictEqual(await db.posts.count(), len);
  });

  it('db.comments.count()', async () => {
    deepStrictEqual(await db.comments.count(), 5);
  });

  it('db.comments.all({ param })', async () => {
    deepStrictEqual(await db.comments.all({ param: {} }), c);
    deepStrictEqual(await db.comments.all({ param: { postId: 1 } }), [c[0], c[3], c[4]]);
    deepStrictEqual(await db.comments.all({ param: { postId: [1, 2] } }), [c[0], c[1], c[3], c[4]]);
    deepStrictEqual(await db.comments.all({ param: { body: 'some comment 2' } }), [c[1]]);
    deepStrictEqual(await db.comments.all({ param: { body: 'some comment 2', postId: 1 } }), []);
  });

  it('db.comments.all({ like, param })', async () => {
    deepStrictEqual(await db.comments.all({ param: { postId: 1 }, like: { body: '5' } }), [c[4]]);
    deepStrictEqual(await db.comments.all({ param: { postId: [1, 2] }, like: { body: '5' } }), [
      c[4],
    ]);
  });

  it('db.comments.add/delete()', async () => {
    deepStrictEqual((await db.comments.add({ body: '12345', postId: 1 }))?.id, 6);
    await db.comments.delete(6);
    deepStrictEqual(await db.comments.all(), c);
  });

  it('db.comments.add() +validation', async () => {
    rejects(async () => db.comments.add({ body: '12345' }));
    rejects(async () => db.comments.add({ body: '1234', postId: 1 }));
  });

  it('db.comments.update()', async () => {
    deepStrictEqual((await db.comments.update({ id: 1, body: '12345', postId: 1 }))?.body, '12345');
  });

  it('db.users.count()', async () => {
    deepStrictEqual(await db.users.count(), 2);
  });

  it('db.users.add/delete()', async () => {
    deepStrictEqual((await db.users.add({ name: 'test', token: '123' }))?.id, 3);
    await db.users.delete(3);
    deepStrictEqual(await db.users.all(), u);
  });

  it('db.users.add() +validation', async () => {
    rejects(async () => db.users.add({ name: 'test' }));
    rejects(async () => db.users.add({ name: '', token: '123' }));
  });

  it('db.users.update()', async () => {
    deepStrictEqual((await db.users.update({ id: 1, name: '1', token: '123' }))?.name, '1');
  });
});
