import { Application } from 'express';
import http from 'http';
import jsonServer from 'json-server';
import 'mocha';
import { JSPlural, JSSingular } from '../src';
import { runPluralSpec, runSingularSpec } from '../src/x-server-orm/src/test';
import dbJson from '../src/x-server-orm/src/test/db.json';
import { Comment } from '../src/x-server-orm/src/test/entity/comment.entity';
import { Post } from '../src/x-server-orm/src/test/entity/post.entity';
import { Product } from '../src/x-server-orm/src/test/entity/product.entity';
import { Profile } from '../src/x-server-orm/src/test/entity/profile.entity';
import { User } from '../src/x-server-orm/src/test/entity/user.entity';

const createJsonServer = (source: unknown): Application => {
  const app = jsonServer.create();
  const router = jsonServer.router(source as any);
  const middlewares = jsonServer.defaults();

  app.use(middlewares);
  app.use('/api', router);

  return app;
};

const port = 31989 + Math.floor(Math.random() * 10000);
const s = `http://localhost:${port}/api`;
const app = createJsonServer(dbJson);
const db = {
  posts: new JSPlural<Post>(Post, s),
  comments: new JSPlural<Comment>(Comment, s),
  users: new JSPlural<User>(User, s),
  products: new JSPlural<Product>(Product, s),
  profile: new JSSingular<Profile>(Profile, s),
};

describe(`orm`, () => {
  let server: http.Server;

  before((done) => {
    server = http.createServer(app);
    server.listen(port, done);
  });
  after(async () => server.close());

  runSingularSpec(db);
  runPluralSpec(db);
});
