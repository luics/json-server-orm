import { ok, rejects, strictEqual } from 'assert';
import { Singular } from '..';
import { Profile } from './entity/profile.entity';

export function runSingularSpec(db: { profile: Singular<Profile> }): void {
  it('init', async () => ok(db.profile));
  it('db.profile.one()', async () => ok(await db.profile.one()));
  it('db.profile.one()', async () => strictEqual((await db.profile.one()).name, "luics's blog"));
  it('db.profile.update()', async () =>
    strictEqual((await db.profile.update({ name: 'luics' })).name, 'luics'));
  it('db.profile.update()', async () =>
    strictEqual((await db.profile.update({ name: 'luics', desc: '123' })).desc, '123'));
  it('db.profile.update()', async () => {
    strictEqual((await db.profile.update({ name: 'luics', age: 1 })).age, 1);
    strictEqual((await db.profile.one()).age, 1);
  });
  // it('db.profile.update() +override', async () => strictEqual((await db.profile.update({ name: 'luics' }, true))?.desc, undefined));
  it('db.profile.update() +validation', async () => rejects(db.profile.update({ name1: '1234' })));
  it('db.profile.update() +validation', async () => rejects(db.profile.update({ name: '1234' })));
}
