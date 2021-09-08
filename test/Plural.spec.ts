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

const port = 31989;
const s = `http://localhost:${port}/api`;
const app = my
  ? getMysqlServerApp({ mysqlConfig: config.mysql, level: 'access' }) //
  : getJsonServerApp({ watch: dbJson, level: 'access' });
const v = new Validation(schema);
const db = {
  posts: my
    ? new MSPlural<Post>(s, 'posts', v.validation.post)
    : new JSPlural<Post>(s, 'posts', v.validation.post),
  comments: my
    ? new MSPlural<Comment>(s, 'comments', v.validation.comment)
    : new JSPlural<Comment>(s, 'comments', v.validation.comment),
  users: my
    ? new MSPlural<User>(s, 'users', v.validation.user)
    : new JSPlural<User>(s, 'users', v.validation.user),
};
const { comments: c, posts: p, users: u } = dbJson;
const len = p.length;
let server: http.Server;

describe(`Plural [${my ? 'mysql-server' : 'json-server'}]`, () => {
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
    deepStrictEqual((await db.posts.all()).length, len);
  });

  it('db.posts.all({ ids })', async () => {
    deepStrictEqual((await db.posts.all({ ids: [] })).length, len);
    deepStrictEqual((await db.posts.all({ ids: [1] })).length, 1);
    deepStrictEqual((await db.posts.all({ ids: [1, 2] })).length, 2);
    deepStrictEqual((await db.posts.all({ ids: [1, 10000] })).length, 1);
  });

  it('db.posts.all({ limit })', async () => {
    deepStrictEqual((await db.posts.all({ limit: 1 })).length, 1);
    deepStrictEqual((await db.posts.all({ limit: len })).length, len);
    // TODO deepStrictEqual((await db.posts.all({ limit: -1 })).length, len - 1);
    deepStrictEqual((await db.posts.all({ limit: len + 1 })).length, len);
  });

  // it('db.posts.all({ page: 0 })', async () => {
  //   const posts = await db.posts.all({ page: 0 });
  //   deepStrictEqual(posts.length, 10);
  //   deepStrictEqual(posts[0].id, 1);
  //   deepStrictEqual(posts[9].id, 10);
  // });

  // it('db.posts.all({ page: 1 })', async () => {
  //   const posts = await db.posts.all({ page: 1 });
  //   deepStrictEqual(posts.length, 10);
  //   deepStrictEqual(posts[0].id, 1);
  //   deepStrictEqual(posts[9].id, 10);
  // });

  // it('db.posts.all({ page: 1, limit: 5 })', async () => {
  //   const posts = await db.posts.all({ page: 1, limit: 5 });
  //   deepStrictEqual(posts.length, 5);
  //   deepStrictEqual(posts[0].id, 1);
  //   deepStrictEqual(posts[4].id, 5);
  // });

  // it('db.posts.all({ page: 4, limit: 5 })', async () => {
  //   const posts = await db.posts.all({ page: 4, limit: 5 });
  //   deepStrictEqual(posts.length, 5);
  //   deepStrictEqual(posts[0].id, 16);
  //   deepStrictEqual(posts[4].id, 20);
  // });

  it('db.posts.all({ sort, order })', async () => {
    deepStrictEqual((await db.posts.all({ sort: 'id' }))[0].id, 1);
    deepStrictEqual((await db.posts.all({ sort: 'id', order: 'asc' }))[0].id, 1);
    deepStrictEqual((await db.posts.all({ sort: 'id', order: 'desc' }))[0].id, 20);
  });

  // it('db.posts.all({ start, end, limit })', async () => {
  //   deepStrictEqual((await db.posts.all({ start: 0, end: 1 })).length, 1);
  //   deepStrictEqual((await db.posts.all({ start: 0, end: 1 }))[0].id, 1);
  //   deepStrictEqual((await db.posts.all({ start: 0, end: 10 }))[9].id, 10);
  //   deepStrictEqual((await db.posts.all({ start: 0, end: 10, limit: 5 }))[4].id, 5);
  //   deepStrictEqual((await db.posts.all({ start: 1, end: 1 })).length, 0);
  // });

  // it('db.posts.all({ gte, lte })', async () => {
  //   deepStrictEqual(
  //     (await db.posts.all({ gte: [{ n: 'id', v: 1 }], lte: [{ n: 'id', v: 5 }] }))
  //       .length,
  //     5
  //   );
  //   deepStrictEqual(
  //     (await db.posts.all({ gte: [{ n: 'id', v: 1 }], lte: [{ n: 'id', v: 5 }] }))[0]
  //       .id,
  //     1
  //   );
  //   deepStrictEqual(
  //     (await db.posts.all({ gte: [{ n: 'id', v: 1 }], lte: [{ n: 'id', v: 5 }] }))[4]
  //       .id,
  //     5
  //   );
  // });

  // it('db.posts.all({ ne })', async () => {
  //   deepStrictEqual((await db.posts.all({ ne: [{ n: 'id', v: 1 }] })).length, len - 1);
  //   deepStrictEqual(
  //     (
  //       await db.posts.all({
  //         ne: [
  //           { n: 'id', v: 1 },
  //           { n: 'id', v: 2 },
  //         ],
  //       })
  //     ).length,
  //     len - 2
  //   );
  //   deepStrictEqual(
  //     (
  //       await db.posts.all({
  //         ne: [
  //           { n: 'id', v: 1 },
  //           { n: 'id', v: 10000 },
  //         ],
  //       })
  //     ).length,
  //     len - 1
  //   );
  // });

  it('db.posts.all({ like })', async () => {
    deepStrictEqual((await db.posts.all({ like: { title: 'wer' } })).length, 1);
    deepStrictEqual((await db.posts.all({ like: { title: 'post' } })).length, 18);
  });

  // it('db.posts.all({ q })', async () => {
  //   deepStrictEqual((await db.posts.all({ q: 'wer' })).length, 1);
  // });

  // it('db.posts.all({ expand })', async () => {
  //   deepStrictEqual((await db.posts.all({ ids: [1] }))[0].user, undefined);
  //   deepStrictEqual((await db.posts.all({ ids: [1], expand: ['user'] }))[0].user?.id, 1);
  // });

  // it('db.posts.all({ embed })', async () => {
  //   deepStrictEqual((await db.posts.all({ ids: [1] }))[0].comments, undefined);
  //   deepStrictEqual((await db.posts.all({ ids: [1], embed: ['comments'] }))[0].comments?.length, 3);
  // });

  it('db.posts.one()', async () => {
    deepStrictEqual((await db.posts.one(1))?.id, 1);
    deepStrictEqual((await db.posts.one(0))?.id, undefined);
  });

  it('db.posts.add/delete()', async () => {
    deepStrictEqual((await db.posts.add({ title: 'post from test', userId: 1 }))?.id, len + 1);
    deepStrictEqual((await db.posts.add({ title: 'post from test', userId: 1 }))?.id, len + 2);
    await db.posts.delete(len + 2);
    await db.posts.delete(len + 1);
    deepStrictEqual((await db.posts.all()).length, len);
  });

  it('db.posts.add() +validation', async () => {
    rejects(async () => db.posts.add({ title: 'post from test' })); // ValidationError
    rejects(async () => db.posts.add({ title: 'post', userId: 1 }));
  });

  it('db.posts.update()', async () => {
    deepStrictEqual((await db.posts.update({ id: 1, title: '12345', userId: 1 }))?.title, '12345');
    deepStrictEqual((await db.posts.update({ id: 1, title: '12345', userId: 2 }))?.userId, 2);
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
    deepStrictEqual((await db.users.add({ name: 'test', token: '123' } as any))?.id, 3);
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
