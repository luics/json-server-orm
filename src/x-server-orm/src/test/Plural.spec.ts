import { asyncThrows } from '@luics/async-throws';
import { deepStrictEqual, ok, rejects } from 'assert';
import { Plural } from '..';
import dbJson from './db.json';
import { Comment } from './entity/comment.entity';
import { Post } from './entity/post.entity';
import { Product } from './entity/product.entity';
import { User } from './entity/user.entity';

export function runPluralSpec(db: {
  posts: Plural<Post>;
  users: Plural<User>;
  comments: Plural<Comment>;
  products: Plural<Product>;
}): void {
  const { comments: cs, posts: ps, users: us, groups: gs, tags: ts, products: pds } = dbJson; //
  const len = ps.length;

  it('init', async () => {
    ok(db);
    ok(db.users);
  });

  it('db.posts.all()', async () => {
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

  it('db.posts.all({ expand }) + update()', async () => {
    const p = await db.posts.one(1, { expand: ['user'] });
    deepStrictEqual(p, { ...ps[0], user: us[0] });
    await db.posts.update(p);
    deepStrictEqual(p, { ...ps[0], user: us[0] });
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
    deepStrictEqual(await db.posts.all({ ids: [1], contain: ['user', 'comments'] }), [
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
    deepStrictEqual(await db.posts.one(1), ps[0]);
    deepStrictEqual(await db.posts.one(1, { expand: ['user'] }), { ...ps[0], user: us[0] });
    deepStrictEqual(await db.posts.one(1, { param: { title: '123' } }), undefined);
    deepStrictEqual(await db.posts.one(0), undefined);
  });

  it('db.posts.add/delete()', async () => {
    const id1 = (await db.posts.add({ title: 'post from test', userId: 1, groupId: 1 })).id;
    ok(id1 > len);
    await db.posts.delete(id1);

    const id2 = (await db.posts.add({ title: 'post from test', userId: 1, groupId: 2 })).id;
    ok(id2 > len);
    await db.posts.delete(id2);

    deepStrictEqual(await db.posts.count(), len);
  });

  it('db.posts.add/delete() [expand/embed data]', async () => {
    const id3 = (
      await db.posts.add({
        title: 'post from test',
        userId: 1,
        groupId: 1,
        user: { id: 1, name: 'typicode', token: '123' },
        group: { id: 1, name: 'tech' },
      })
    ).id;
    ok(id3 > len);
    await db.posts.delete(id3);

    const p = await db.posts.one(20, { expand: ['user'], embed: ['comments'] });
    ok(p);
    ok(await db.posts.update({ ...p, title: 'post from test' }));
  });

  it('db.posts.add() +validation', async () => rejects(db.posts.add({ title: 'post from test' })));

  it('db.posts.add() +validation', async () => rejects(db.posts.add({ title: 'post', userId: 1 })));

  it('db.posts.update()', async () => {
    deepStrictEqual(
      (await db.posts.update({ id: 1, title: '12345', userId: 1, groupId: 1 })).title,
      '12345'
    );
    deepStrictEqual(
      (await db.posts.update({ id: 1, title: '12345', userId: 2, groupId: 1 })).userId,
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
    deepStrictEqual(await db.comments.all({ param: {}, sort: 'id' }), cs);
    deepStrictEqual(await db.comments.all({ param: { postId: 1 }, sort: 'id' }), [
      cs[0],
      cs[3],
      cs[4],
    ]);
    deepStrictEqual(await db.comments.all({ param: { postId: [1, 2] }, sort: 'id' }), [
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
    deepStrictEqual((await db.comments.add({ body: '12345', postId: 1 })).id, 6);
    await db.comments.delete(6);
    deepStrictEqual(await db.comments.all(), cs);
  });

  it('hit db.comments.add() +validation', async () => rejects(db.comments.add({ body: '12345' })));

  it('db.comments.add() +validation', async () =>
    rejects(db.comments.add({ body: '1234', postId: 1 })));

  it('db.comments.update()', async () => {
    deepStrictEqual((await db.comments.update({ id: 1, body: '12345', postId: 1 })).body, '12345');
  });

  it('db.users.count()', async () => deepStrictEqual(await db.users.count(), 2));

  it('db.users.add/delete()', async () => {
    deepStrictEqual((await db.users.add({ name: 'test', token: '123' })).id, 3);
    await db.users.delete(3);
    deepStrictEqual((await db.users.add({ name: 'test', token: '123', name1: '' })).id, 4);
    await db.users.delete(4);
    deepStrictEqual(await db.users.all(), us);
  });

  it('hit db.users.add() +validation', async () => rejects(db.users.add({})));

  it('hit db.users.add() +validation', async () =>
    rejects(db.users.add({ name: '', token: '123' })));

  // it('hit db.users.add() +validation', async () =>
  //   rejects(db.users.add({ name: 'test', token: '123', name1: '' })));

  it('db.users.update()', async () => {
    deepStrictEqual((await db.users.update({ id: 1, name: '1', token: '123' })).name, '1');
  });

  it('db.products.all()', async () => {
    deepStrictEqual(await db.products.all(), pds);
    deepStrictEqual(await db.products.one(1), pds[0]);
  });

  it('db.products.update()', async () => {
    const p1 = { id: 1, arr: [], obj: {} };
    ok(await db.products.update(p1));

    ok(await db.products.update({ ...p1, arr: ['a'] }));
    deepStrictEqual(await db.products.one(1), { ...p1, arr: ['a'] });
    ok(await db.products.update({ ...p1, arr: ['a', 'b'] }));
    deepStrictEqual(await db.products.one(1), { ...p1, arr: ['a', 'b'] });
    await db.products.update({ ...p1 });
    deepStrictEqual(await db.products.one(1), p1);

    ok(await db.products.update({ ...p1, obj: { a: 1 } }));
    deepStrictEqual(await db.products.one(1), { ...p1, obj: { a: 1 } });
    ok(await db.products.update({ ...p1, obj: { a: 1, b: 1 } }));
    deepStrictEqual(await db.products.one(1), { ...p1, obj: { a: 1, b: 1 } });
    ok(await db.products.update({ ...p1 }));
    deepStrictEqual(await db.products.one(1), p1);
  });

  it('db.products.update() [invalid]', async () => {
    // await asyncThrows(() => db.products.update({ id: 1, arr: [], obj: {} }));
    await asyncThrows(() => db.products.update({ id: 1, arr: [1 as any], obj: {} }));
  });
}
