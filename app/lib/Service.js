/**
 * Base service class.
 */
'use strict';

const Api      = require('./Api');
const merge    = require('merge');

class Service {
  
  constructor(options) {
    if (!options.uri) {
      throw new Error('No uri defined for service');
    }
    this._options = options;
    this.loadEndpoints();
  }
  
  set (uri) {
    if (uri.charAt(uri.length !== '/')) {
      uri += '/';
    }
    this._options.uri = uri;
  }
  
  get uri() {
    return this._options.uri;
  }
  
  get endpoints() {
    return [];
  }
  
  set options(options) {
    this._options = options;
  }
  
  get options() {
    return this._options;
  }
  
  loadEndpoints() {
    let endpoints = this.endpoints;
    let that = this;
    endpoints.map(endpoint => {
      let path = (!!endpoint.path && endpoint.path.trim() !== '/') ? endpoint.path : '';
      let name = !!endpoint.name ? endpoint.name : path.toLowerCase().replace(/\//gi, '_');
      let method = (!!endpoint.method ? endpoint.method : 'get').toLowerCase();
      that[name] = (options) => {
        let url = `${that._options.uri}/${path}`;
        if (typeof options === 'string') {
          url += options;
          options = {};
        }
        if (endpoint.qs) {
          if (!options.qs) {
            options.qs = endpoint.qs;
          } else {
            options.qs = merge.recursive(true, endpoint.qs, options.qs);
          }
        }
        return Api.req(method, url, options)
          .then(response => {
            return response;
          }).catch(err => {
            throw err; 
          });
        };
    });
  }
  
}

module.exports = Service;


