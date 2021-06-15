import path from 'path';
import { Server } from 'http';
import jsonServer from 'json-server';

let server: Server;

export function start(db?: string | object, port?: number, isProduction?: boolean) {
  db = db || process.argv[2] || 'db.json';

  port = port || parseInt(process.env.PORT || '3000');
  if (isProduction === undefined) isProduction = process.env.NODE_ENV === 'production';

  const app = jsonServer.create();
  const middlewares = jsonServer.defaults({
    static: path.join(__dirname, 'www'),
    logger: !isProduction,
  });
  const router = jsonServer.router(
    typeof db === 'object'
      ? db
      : db.startsWith('/') ? db : path.join(__dirname, db)
  );

  // Set default middlewares (logger, static, cors and no-cache)
  app.use(middlewares);
  // To handle POST, PUT and PATCH you need to use a body-parser
  app.use(jsonServer.bodyParser);

  //
  // Routers
  //
  app.use('/api', router);

  //
  // Start server
  //
  server = app.listen(port, () => {
    console.log('JSON Server is running at', port, 'with', typeof db === 'string' ? db : '[object]');
  });
}

export function close() {
  if (server) {
    server.close();
    console.log('JSON server is closed.');
  }
}

// Run in cli
if (require.main === module) {
  start();
}