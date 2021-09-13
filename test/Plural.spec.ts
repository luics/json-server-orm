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
const { comments: cs, posts: ps, users: us, groups: gs, tags: ts } = dbJson; //
const len = ps.length;

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
    deepStrictEqual(await db.posts.all(), ps);
  });

  it('db.posts.all({ param })', async () => {
    deepStrictEqual(await db.posts.all({ param: {} }), ps);
    deepStrictEqual(await db.posts.all({ param: { userId: 2 } }), [ps[2], ...ps.slice(5, 10)]);
    deepStrictEqual(await db.posts.all({ param: { userId: [1, 2] } }), ps);
    deepStrictEqual(await db.posts.all({ param: { title: 'post from ab' } }), ps.slice(10, 20));
    deepStrictEqual(await db.posts.all({ param: { title: 'post from ab', userId: 0 } }), []);
  });

  // it('db.posts.all({ q })', async () => {
  //   deepStrictEqual((await db.posts.all({ q: 'wer' })).length, 1);
  // });

  it('db.posts.all({ like })', async () => {
    deepStrictEqual(await db.posts.all({ like: { title: 'wer' } }), [ps[3]]);
    deepStrictEqual((await db.posts.all({ like: { title: 'post' } })).length, 18);
  });

  it('db.posts.all({ ids })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [] }), ps);
    deepStrictEqual(await db.posts.all({ ids: [1] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1, 2] }), [ps[0], ps[1]]);
    deepStrictEqual(await db.posts.all({ ids: [1, 10000] }), [ps[0]]);
  });

  it('db.posts.all({ gte, lte })', async () => {
    deepStrictEqual(await db.posts.all({ lte: { id: 3 } }), [ps[0], ps[1], ps[2]]);
    deepStrictEqual(await db.posts.all({ gte: { id: 18 } }), [ps[17], ps[18], ps[19]]);
    deepStrictEqual(await db.posts.all({ gte: { id: 2 }, lte: { id: 3 } }), [ps[1], ps[2]]);
  });

  it('db.posts.all({ ne })', async () => {
    deepStrictEqual((await db.posts.all({ ne: { id: 1 } })).length, len - 1);
    deepStrictEqual((await db.posts.all({ ne: { id: [1, 2] } })).length, len - 2);
    deepStrictEqual((await db.posts.all({ ne: { id: [1, 10000] } })).length, len - 1);
  });

  it('db.posts.all({ sort, order })', async () => {
    deepStrictEqual(await db.posts.all({ sort: 'id' }), ps);
    deepStrictEqual(await db.posts.all({ sort: 'id', order: 'asc' }), ps);
    deepStrictEqual(await db.posts.all({ sort: 'id', order: 'desc' }), [...ps].reverse());
  });

  it('db.posts.all({ limit })', async () => {
    deepStrictEqual(await db.posts.all({ limit: 1 }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ limit: len }), ps);
    // TODO deepStrictEqual((await db.posts.all({ limit: -1 })).length, len - 1);
    deepStrictEqual(await db.posts.all({ limit: len + 1 }), ps);
  });

  it('db.posts.all({ page })', async () => {
    deepStrictEqual(await db.posts.all({ page: 0 }), ps.slice(0, 10));
    deepStrictEqual(await db.posts.all({ page: 1 }), ps.slice(0, 10));
    deepStrictEqual(await db.posts.all({ page: 1, limit: 5 }), ps.slice(0, 5));
    deepStrictEqual(await db.posts.all({ page: 4, limit: 5 }), ps.slice(15, 20));
  });

  it('db.posts.all({ start, end, limit })', async () => {
    deepStrictEqual(await db.posts.all({ start: 0, end: 1 }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ end: 1 }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ start: 0, end: 10 }), ps.slice(0, 10));
    deepStrictEqual(await db.posts.all({ start: 0, limit: 5 }), ps.slice(0, 5));
    deepStrictEqual(await db.posts.all({ start: 1, end: 1 }), []);
    deepStrictEqual(await db.posts.all({ start: 1, limit: 0 }), []);
  });

  it('db.posts.all({ page, start, end, limit })', async () => {
    deepStrictEqual(await db.posts.all({ page: 1, limit: 5, start: 10, end: 20 }), ps.slice(0, 5));
    deepStrictEqual(await db.posts.all({ page: 1, start: 10, end: 20 }), ps.slice(0, 10));
  });

  it('db.posts.all({ expand })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [1] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: [] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: ['user'] }), [
      { ...ps[0], user: us[0] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1, 3], expand: ['user'] }), [
      { ...ps[0], user: us[0] },
      { ...ps[2], user: us[1] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: ['user', 'group'] }), [
      { ...ps[0], user: us[0], group: gs[0] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1, 2], expand: ['user', 'group'] }), [
      { ...ps[0], user: us[0], group: gs[0] },
      { ...ps[1], user: us[0], group: gs[1] },
    ]);
  });

  it('db.posts.all({ embed })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [1] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], embed: [] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], embed: ['comments'] }), [
      { ...ps[0], comments: [cs[0], cs[3], cs[4]] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1, 2], embed: ['comments'] }), [
      { ...ps[0], comments: [cs[0], cs[3], cs[4]] },
      { ...ps[1], comments: [cs[1]] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1], embed: ['comments', 'tags'] }), [
      { ...ps[0], comments: [cs[0], cs[3], cs[4]], tags: [ts[0], ts[3], ts[4]] },
    ]);
    deepStrictEqual(await db.posts.all({ ids: [1, 2], embed: ['comments', 'tags'] }), [
      { ...ps[0], comments: [cs[0], cs[3], cs[4]], tags: [ts[0], ts[3], ts[4]] },
      { ...ps[1], comments: [cs[1]], tags: [ts[1]] },
    ]);
  });

  it('db.posts.all({ expand, embed })', async () => {
    deepStrictEqual(await db.posts.all({ ids: [1], expand: [], embed: [] }), [ps[0]]);
    deepStrictEqual(await db.posts.all({ ids: [1], expand: ['user'], embed: ['comments'] }), [
      { ...ps[0], user: us[0], comments: [cs[0], cs[3], cs[4]] },
    ]);
    deepStrictEqual(
      await db.posts.all({ ids: [1, 2], expand: ['user', 'group'], embed: ['comments', 'tags'] }),
      [
        {
          ...ps[0],
          user: us[0],
          group: gs[0],
          comments: [cs[0], cs[3], cs[4]],
          tags: [ts[0], ts[3], ts[4]],
        },
        {
          ...ps[1],
          user: us[0],
          group: gs[1],
          comments: [cs[1]],
          tags: [ts[1]],
        },
      ]
    );
    // check sql syntax
    ok(
      await db.posts.all({
        expand: ['user', 'group'],
        embed: ['comments', 'tags'],
        like: { title: 'post' },
        limit: 3,
        gte: { id: 1 },
        sort: 'id',
      })
    );
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
    deepStrictEqual(await db.comments.all({ param: {} }), cs);
    deepStrictEqual(await db.comments.all({ param: { postId: 1 } }), [cs[0], cs[3], cs[4]]);
    deepStrictEqual(await db.comments.all({ param: { postId: [1, 2] } }), [
      cs[0],
      cs[1],
      cs[3],
      cs[4],
    ]);
    deepStrictEqual(await db.comments.all({ param: { body: 'some comment 2' } }), [cs[1]]);
    deepStrictEqual(await db.comments.all({ param: { body: 'some comment 2', postId: 1 } }), []);
  });

  it('db.comments.all({ like, param })', async () => {
    deepStrictEqual(await db.comments.all({ param: { postId: 1 }, like: { body: '5' } }), [cs[4]]);
    deepStrictEqual(await db.comments.all({ param: { postId: [1, 2] }, like: { body: '5' } }), [
      cs[4],
    ]);
  });

  it('db.comments.add/delete()', async () => {
    deepStrictEqual((await db.comments.add({ body: '12345', postId: 1 }))?.id, 6);
    await db.comments.delete(6);
    deepStrictEqual(await db.comments.all(), cs);
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
    deepStrictEqual(await db.users.all(), us);
  });

  it('db.users.add() +validation', async () => {
    rejects(async () => db.users.add({ name: 'test' }));
    rejects(async () => db.users.add({ name: '', token: '123' }));
  });

  it('db.users.update()', async () => {
    deepStrictEqual((await db.users.update({ id: 1, name: '1', token: '123' }))?.name, '1');
  });
});
