import 'mocha';
import { ok, strictEqual, rejects } from 'assert';
import { Table } from '../src';
import * as Server from './server/server';
import dbJson from './server/db.json';
import { Post, User, Comment } from './server/schema';
import { validation } from './server/validation';

// let db: { [key: string]: Table<Schema> };
const port = 31989;
const server = `http://localhost:${port}/api/`;
const db = {
  posts: new Table<Post>(server, 'posts', validation.post),
  users: new Table<User>(server, 'users', validation.user),
  comments: new Table<Comment>(server, 'comments', validation.comment),
};
const len = dbJson.posts.length;

describe('Table', () => {
  before(async () => Server.start(dbJson, port, false));

  after(async () => Server.close());

  it('init', async () => {
    ok(db);
    ok(db.posts);
  });

  it('db.posts.all()', async () => {
    ok((await db.posts.all()).length > 0);
    strictEqual((await db.posts.all()).length, len);
  });

  it('db.posts.all({ ids })', async () => {
    strictEqual((await db.posts.all({ ids: [] })).length, len);
    strictEqual((await db.posts.all({ ids: [1] })).length, 1);
    strictEqual((await db.posts.all({ ids: [1, 2] })).length, 2);
    strictEqual((await db.posts.all({ ids: [1, 10000] })).length, 1);
  });

  it('db.posts.all({ limit })', async () => {
    strictEqual((await db.posts.all({ limit: 1 })).length, 1);
    strictEqual((await db.posts.all({ limit: len })).length, len);
    strictEqual((await db.posts.all({ limit: -1 })).length, len - 1);
    strictEqual((await db.posts.all({ limit: len + 1 })).length, len);
  });

  it('db.posts.all({ page: 0 })', async () => {
    const posts = await db.posts.all({ page: 0 });
    strictEqual(posts.length, 10);
    strictEqual(posts[0].id, 1);
    strictEqual(posts[9].id, 10);
  });

  it('db.posts.all({ page: 1 })', async () => {
    const posts = await db.posts.all({ page: 1 });
    strictEqual(posts.length, 10);
    strictEqual(posts[0].id, 1);
    strictEqual(posts[9].id, 10);
  });

  it('db.posts.all({ page: 1, limit: 5 })', async () => {
    const posts = await db.posts.all({ page: 1, limit: 5 });
    strictEqual(posts.length, 5);
    strictEqual(posts[0].id, 1);
    strictEqual(posts[4].id, 5);
  });

  it('db.posts.all({ page: 4, limit: 5 })', async () => {
    const posts = await db.posts.all({ page: 4, limit: 5 });
    strictEqual(posts.length, 5);
    strictEqual(posts[0].id, 16);
    strictEqual(posts[4].id, 20);
  });

  it('db.posts.all({ sort, order })', async () => {
    strictEqual((await db.posts.all({ sort: 'id' }))[0].id, 1);
    strictEqual((await db.posts.all({ sort: 'id', order: 'asc' }))[0].id, 1);
    strictEqual((await db.posts.all({ sort: 'id', order: 'desc' }))[0].id, 20);
  });

  it('db.posts.all({ start, end, limit })', async () => {
    strictEqual((await db.posts.all({ start: 0, end: 1 })).length, 1);
    strictEqual((await db.posts.all({ start: 0, end: 1 }))[0].id, 1);
    strictEqual((await db.posts.all({ start: 0, end: 10 }))[9].id, 10);
    strictEqual((await db.posts.all({ start: 0, end: 10, limit: 5 }))[4].id, 5);
    strictEqual((await db.posts.all({ start: 1, end: 1 })).length, 0);
  });

  it('db.posts.all({ gte, lte })', async () => {
    strictEqual((await db.posts.all({ gte: [{ name: 'id', value: 1 }], lte: [{ name: 'id', value: 5 }] })).length, 5);
    strictEqual((await db.posts.all({ gte: [{ name: 'id', value: 1 }], lte: [{ name: 'id', value: 5 }] }))[0].id, 1);
    strictEqual((await db.posts.all({ gte: [{ name: 'id', value: 1 }], lte: [{ name: 'id', value: 5 }] }))[4].id, 5);
  });

  it('db.posts.all({ ne })', async () => {
    strictEqual((await db.posts.all({ ne: [{ name: 'id', value: 1 }] })).length, len - 1);
    strictEqual((await db.posts.all({ ne: [{ name: 'id', value: 1 }, { name: 'id', value: 2 }] })).length, len - 2);
    strictEqual((await db.posts.all({ ne: [{ name: 'id', value: 1 }, { name: 'id', value: 10000 }] })).length, len - 1);
  });

  it('db.posts.all({ like })', async () => {
    strictEqual((await db.posts.all({ like: [{ name: 'title', value: 'wer' }] })).length, 1);
    strictEqual((await db.posts.all({ like: [{ name: 'title', value: 'post' }] })).length, 18);
  });

  it('db.posts.all({ q })', async () => {
    strictEqual((await db.posts.all({ q: 'wer' })).length, 1);
  });

  it('db.posts.all({ expand })', async () => {
    strictEqual((await db.posts.all({ ids: [1] }))[0].user, undefined);
    strictEqual((await db.posts.all({ ids: [1], expand: ['user'] }))[0].user?.id, 1);
  });

  it('db.posts.all({ embed })', async () => {
    strictEqual((await db.posts.all({ ids: [1] }))[0].comments, undefined);
    strictEqual((await db.posts.all({ ids: [1], embed: ['comments'] }))[0].comments?.length, 3);
  });

  it('db.posts.one()', async () => {
    strictEqual((await db.posts.one(1))?.id, 1);
    strictEqual((await db.posts.one(0))?.id, undefined);
  });

  it('db.posts.add/delete()', async () => {
    strictEqual((await db.posts.add({ title: 'post from test', userId: 1 }))?.id, len + 1);
    strictEqual((await db.posts.add({ title: 'post from test', userId: 1 }))?.id, len + 2);
    await db.posts.delete(len + 2);
    await db.posts.delete(len + 1);
    strictEqual((await db.posts.all()).length, len);
  });

  it('db.posts.add() +validation', async () => {
    rejects(async () => await db.posts.add({ title: 'post from test' })); // ValidationError
    rejects(async () => await db.posts.add({ title: 'post', userId: 1 }));
  });

  it('db.posts.update()', async () => {
    strictEqual((await db.posts.update({ id: 1, title: '12345', userId: 1 }))?.title, '12345');
    strictEqual((await db.posts.update({ id: 1, title: '12345', userId: 2 }))?.userId, 2);
  });

  it('db.posts.count()', async () => {
    strictEqual((await db.posts.count()), len);
  });

  it('db.comments.count()', async () => {
    strictEqual((await db.comments.count()), 5);
  });

  it('db.comments.all()', async () => {
    strictEqual((await db.comments.all()).length, 5);
    strictEqual((await db.comments.all({ param: [{ name: 'postId', value: 1 }] })).length, 3);
    strictEqual((await db.comments.all({ param: [{ name: 'postId', value: 1 }, { name: 'postId', value: 2 }] })).length, 4);
  });

  it('db.comments.add/delete()', async () => {
    strictEqual((await db.comments.add({ body: '12345', postId: 1 }))?.id, 6);
    await db.comments.delete(6);
    strictEqual((await db.comments.all()).length, 5);
  });

  it('db.comments.add() +validation', async () => {
    rejects(async () => await db.comments.add({ body: '12345' }));
    rejects(async () => await db.comments.add({ body: '1234', postId: 1 }));
  });

  it('db.comments.update()', async () => {
    strictEqual((await db.comments.update({ id: 1, body: '12345', postId: 1 }))?.body, '12345');
  });

  it('db.users.count()', async () => {
    strictEqual((await db.users.count()), 2);
  });

  it('db.users.add/delete()', async () => {
    strictEqual((await db.users.add({ name: 'test', token: '123' }))?.id, 3);
    await db.users.delete(3);
    strictEqual((await db.users.all()).length, 2);
  });

  it('db.users.add() +validation', async () => {
    rejects(async () => await db.users.add({ name: 'test', }));
    rejects(async () => await db.users.add({ name: '', token: '123' }));
  });

  it('db.users.update()', async () => {
    strictEqual((await db.users.update({ id: 1, name: '1', token: '123' }))?.name, '1');
  });

});
