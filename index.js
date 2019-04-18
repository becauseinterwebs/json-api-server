'use strict';

const path            = require('path');
const https           = require('https');
const fs              = require('fs');
const cluster         = require('cluster');
const moment          = require('moment');

const settings        = require('./app/config/settings');
const logger          = require('./app/lib/Logger');
const server          = require('./app/lib/Server');

const cpuCount = require('os').cpus().length;

let init = () => {

  let workers = 1;
  let workerCount = 0;
  let args = process.argv.slice(2);

  for (var i = 0; i < args.length; i++) {
    switch (args[i].toLowerCase()) {
      case '-t':
        i++;
        workers = args[i];
        if (workers > cpuCount) {
          workers = cpuCount;
        }
        break;
    }
  }

  if (cluster.isMaster) {

    console.log('');
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log(`${settings.app.name} v${settings.app.version}`);
    console.log('');
    console.log('Current UTC Time   :', moment().utc().format('Y-MM-DD H:mm:ss'));
    console.log('Current Server Time:', moment().format('Y-MM-DD H:mm:ss'));
    console.log('');
    console.log('Application Path   :', settings.app.path);
    console.log('Node Environment   :', process.env.NODE_ENV);
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log('');

    logger.info('Master process started');

    // Create a worker for each CPU
    for (var i = 0; i < workers; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', function (worker) {
      logger.info('Worker %d died', worker.id);
      cluster.fork();
    });


  } else if (cluster.isWorker) {

    workerCount++;

    // Exit the process when there is an uncaught exception
    console.log('Worker %d running!', cluster.worker.id);
    logger.info('Worker %d running!', cluster.worker.id);

    process.on('uncaughtException', function (e) {
      console.log('Uncaught Exception:', e);
      logger.error('Uncaught Exception: ', e);
    });

    let app = server;

    logger.info('Creating server on port: ' + settings.app.port);

    if (settings.app.https) {
      let options = {
        key: fs.readFileSync(settings.security.ssl_key),
        cert: fs.readFileSync(settings.security.ssl_cert)
      };
      https.createServer(options, app)
        .listen(settings.app.port)
        .on('error', function (e) {
          if (e.code === 'EADDRINUSE') {
            let msg = '*** ADDRESS IN USE! *** Is the server (or another service) already running?';
            logger.error(msg);
            console.log(msg.bgWhite.red);
            process.exit(1);
          } else {
            let msg = 'SERVER ERROR: ' + e.message;
            logger.error(msg);
            console.log(msg.red);
          }
        });
    } else {

      app.listen(settings.app.port, () => {
        console.log('HTTP server online on port ', settings.app.port);
        app.emit('ready');
      });

    }

  }
    
};

module.exports = init();

