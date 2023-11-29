import app from "./app"
const PORT =  process.env.PORT || 5123
const http = require('http');
const log = require('debug')('log');

const startServer = () => {
  const server = http.createServer(app);
  const normalizePort = (val: any) => {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }

    return false;
  };

  const port = normalizePort(PORT);
  app.set('port', port);

  const errorHandler = (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port: ${port}`;
    switch (error.code) {
      case 'EACCES':
        log(`${bind} requires elevated privileges.`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        log(`${bind} is already in use.`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  server.on('error', errorHandler);
  server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
    log(`Listening on ${bind}`);
  });

  server.listen(port, () => {
    console.log('Express server listening on port', port);
  });

  process.on('SIGINT', () => {
    log('Bye bye!');
    process.exit();
  }); // -- for nodemon headache
};

try {
  startServer();
} catch (error: any) {
  // handle errors here
  log(error.message);
  process.exit(-1);
}
