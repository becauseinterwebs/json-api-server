/**
 * Wrapper for request-promise-native to allow for easier usage of Api calls
 */

'use strict';

const request           = require('request-promise-native');

const settings          = require('../config/settings');
const logger            = require('./Logger');


class Api {
  
  constructor() {
    this._token = null;
  }
  
  get(uri, options, auth) {
    return this.req('GET', uri, options, auth);
  }
  
  post(uri, options, auth) {
    return this.req('POST', uri, options);
  }
  
  put(uri, options, auth) {
    return this.req('PUT', uri, options);
  }
  
  delete(uri, options, auth) {
    return this.req('DELETE', uri, options);
  }
  
  patch(uri, options, auth) {
    return this.req('PATCH', uri, options);
  }
  
  get token() {
    return this._token;
  }
  
  set token(token) {
    this._token = token;
  }
  
  createConfig(uri, options) {
    let config = {};
    if (!options) {
      options = {};
    }
    config = Object.assign({}, (!!options ? options : {}));
    config.uri = (typeof uri === 'object' ? uri.uri : uri);
    config.headers = (typeof uri === 'object' 
                        ? (!!uri.headers 
                          ? uri.headers 
                          : (!!options 
                            ? (options.hasOwnProperty('headers')
                              ? options.headers
                              : settings.services.headers) 
                            : settings.services.headers))
                        : settings.services.headers);
    if (options.data) {
      config.body = { data : options.data };
    }
    if (options.path) {
      config.uri += '/' + options.path;
    }
    if (options.query) {
      config.uri += (config.uri.indexOf('?') > -1 ? '&' : '?') + options.query;
    }
    if (options.token) {
      this.token = options.token;
    }
    return config;
  }
  
  req(method, uri, options, auth) {
    let config = this.createConfig(uri, options);
    config.method = method;
    return this.fetch(config, auth);
  }
  
  fetch(options, auth) {
    
    let config = {};
    
    config = Object.assign({}, options);
    
    // Auth is always default
    if (!auth) {
      auth = true;
    }
    
    if (!config.hasOwnProperty('method')) {
      config.method = 'GET';
    }
    
    if (!config.hasOwnProperty('headers') || !config.headers) {
      config.headers = {};
    }
    
    if (!config.headers.hasOwnProperty('User-Agent')) {
      config.headers['User-Agent'] = settings.app.name;
    }
    
    if (auth) {
      if (!config.headers.hasOwnProperty('Authorization')) {
        let token = !!this.token ? this.token : settings.app.secret;
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (!config.headers.hasOwnProperty('Accept')) {
          config.headers['Accept'] = '1';
      }
    }
    
    if (!config.hasOwnProperty('json')) {
      config.json = true;
    }
    
    if (!config.headers.hasOwnProperty('Content-Type')) {
        config.headers['Content-Type'] = 'application/json';
    }

    config.rejectUnauthorized = false;
    config.resolveWithFullResponse = true;
    
    logger.debug('Api.fetch', config);
    
    return request(config)
      .then(result => {
        return result.body;
      });
      
  }
  
}

module.exports = new Api();
