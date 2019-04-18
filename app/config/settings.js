/**
 * Application configuration settings merged with
 * environment-specific settings found in env.js
 * 
 * Please see the README.md file for explanations 
 * and usage examples of these settings.
 */

const path  = require('path');
const merge = require('merge');

// The env.js file contains environment-specific overrides
const env   = require('./env');

const config = {
  // Basic information describing this application.  The 'secret' below is 
  // used when communicating with Adportal and other services to represent 
  // this application (the secret must be configured in Adportal.)
  app: {
    name     : 'Base Microservice Server',
    path     : path.normalize(path.join(__dirname, '..')),
    version  : '1.0.0',
    symbol   : '',
    secret   : '',
    https    : false,
    port     : process.env.NODE_PORT || 4000,
    url      : 'https://www.sample.com'
  },
  // See the README file for logging options
  logging: {
    level  : 'error',
  },
  // Default HTTPS,SSL and token security settings.  
  // Can be overwritten in env.js.
  security   : {
    private_key  : './app/config/private.key',
    public_key   : './app/config/public.pem',
    token_ttl    : 3600,
    refresh_ttl  : 7200,
    algorithm    : 'RS256',
    ssl_key      : './app/config/cert.key',
    ssl_cert     : './app/config/cert.crt',
    allow        : {
      origin  : '*',
      headers : ['Authorization', 'X-Requested-With', 'Origin', 'Content-Type', 'Accept'], 
      methods : ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  },
  // Database configuration.  These entries are provided here for reference and  
  // to provide a few defaults, but are actually defined in env.js where the 
  // provided defaults can also be overwritten.  Please see the README file for 
  // more information regarding database configuration.
  database   : {
    dialect  : "mysql", 
    query    : { 
      pool : true 
    },
    host     : "",
    name     : "",
    user     : "",
    password : "",
    pool     : 1000,
    logging  : true,
    retry    : {
      max : 10
    }
  },
  // The keys here should match the file name(s) (minus the .js) in the 
  // /services folder.  See the README for more information regarding configuration
  // of external services.
  services : { 
    Auth: {
      uri : 'https://some.service.com'
    }
  },
  // This section is where external apps that may need to access this service 
  // are defined along with their permissions.  Each app has a 'secret' key that 
  // represents that application.  See the README for more information.
  // See: /lib/Authenticate.js
  apps: {
    '0000-0000-0000-0000' : {
      symbol : 'symbol',
      routes : {
        '/route/path' : {
          methods : ['GET','POST']
        }
      }
    }
  }
};

// merge the env.js settings into this...
let settings = merge.recursive(true, config, env);

module.exports = settings;


