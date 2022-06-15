import getJsonServerApp from '@luics/json-server-simple';
import { runPluralSpec, runSingularSpec } from '@luics/x-server-orm/cjs/test';
import dbJson from '@luics/x-server-orm/cjs/test/db.json';
import { Comment } from '@luics/x-server-orm/cjs/test/entity/comment.entity';
import { Post } from '@luics/x-server-orm/cjs/test/entity/post.entity';
import { Product } from '@luics/x-server-orm/cjs/test/entity/product.entity';
import { Profile } from '@luics/x-server-orm/cjs/test/entity/profile.entity';
import { User } from '@luics/x-server-orm/cjs/test/entity/user.entity';
import http from 'http';
import 'mocha';
import { JSPlural, JSSingular } from '../src';

const port = 31989 + Math.floor(Math.random() * 10000);
const s = `http://localhost:${port}/api`;
const app = getJsonServerApp({ watch: dbJson, level: 'access', schema: schemaJson });
const db = {
  posts: new JSPlural<Post>(Post, s),
  comments: new JSPlural<Comment>(Comment, s),
  users: new JSPlural<User>(User, s),
  products: new JSPlural<Product>(Product, s),
  profile: new JSSingular<Profile>(Profile, s),
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

  runSingularSpec(db);
  runPluralSpec(db);
});
