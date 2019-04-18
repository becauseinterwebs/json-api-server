/**
 * The service files use a combination of a service url defined in 
 * settings.js/env.js and the endpoints defined in this file.
 */
'use strict';

const Service = require('../lib/Service');
const settings = require('../config/settings');

class Auth extends Service {
  
  constructor(options) {
    super(options);
  }
  
  get endpoints() {
    return [
      {
        name : 'verify',
        path : 'auth/verify'
      },
      {
        path : 'transfer'
      },
      {
        name : 'info',
        path : 'user/info',
        qs : {
          symbol : settings.app.symbol
        }
      },
      {
        path : 'user'
      },
      {
        name : 'search',
        path : 'user/search',
        headers : {
          accept : 2
        }
      }
    ];
  }
  
}

module.exports = Auth;