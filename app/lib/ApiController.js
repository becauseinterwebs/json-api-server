/**
 * This class makes it easy to setup a route-based controller
 */
'use strict';

const Authenticate  = require('./Authenticate');
const merge         = require('merge');

// Default logger if none is specified
const logger = {
  error : (msg) => {
    
  },
  debug : (msg) => {
    
  },
  trace : (msg) => {
    
  },
  info : (msg) => {
    
  }
};

class ApiController {
  
  constructor(options) {
    //router, resource, router, type, title)
    if (options.router === null) {
      throw new Error("Missing required application router");
    }
    
    if (!options.name) {
      options.name = 'ApiController';
    }
    
    if (!options.logger) {
      options.logger = logger;
    }
    
    this._options = options;
    
    this._logger = options.logger;
    
    this._path = !!options.path 
                  ? options.path 
                  : (!!options.name
                    ? options.name.toLowerCase()
                    : null);
                      
    if (!this._path) {
      throw new Error('Missing path');
    }
    
    this._router = options.router;
    
    // set template and route paths
    this._route_path = (!!this._path && this._path !== '') ? this._path : '';
    this._route_path = (this._route_path !== '') ? '/' + this._route_path + '/' : this._route_path;
    
    this._routes = !!options.routes ? options.routes : {};
    
    // add routes and mapped methods
    this.loadRoutes();
    
  }
  
  /**
   * Return a routing object
   * @returns {nm$_ApiController.ApiController.get routes.ApiControllerAnonym$0}
   */
  get routes() {
    return {};
  }
  
  /**
   * Call the Authenticate class to authenticate the request
   * @param {type} req
   * @param {type} res
   * @param {type} next
   * @returns {undefined}
   */
  authenticate (req, res, next) {
    next();
    //Authenticate(req, res, next);
  }
  
  // This should be overridden by the extending controller
  index(req, res, next) {
    res.status(200).json({ data : 'OK' });
  }
  
  /**
   * Loads routes defined in the extending controller
   * @returns {undefined}
   */
  loadRoutes() {
    let services = this.routes;
    let that = this;
    Object.keys(services).map(section => {
      let routes = services[section];
      Object.keys(routes).map(route => {
        let method = routes[route];
        let parts  = route.split(' ');
        // if not specified, GET HTTP METHOD is used
        let verb = (parts.length > 1 ? parts[0] : 'get').toLowerCase();
        // the new path is the base path plus the service's specific path
        let path = `${that._route_path}${(parts.length > 1 ? (parts[1] === '/' ? '' : parts[1]) : (route === '/' ? '' : route))}`;
        // bind to router
        if (!Array.isArray(method)) {
          method = [method];
        }
        if (section === 'authenticate' && method.indexOf('authenticate') < 0) {
          method.unshift('authenticate');
        }
        method.map(f => {
          that._router[verb](path, that[f].bind(that));
        });
      });
    });
  }
  
  /**
   * Return internal logger
   */
  get logger() {
    return this._logger;
  }
  
  /**
   * Generic error log handler
   * @param {type} err
   * @param {type} res
   * @returns {undefined}
   */
  error(err) {
    switch (typeof err) {
      case 'object':
        if (Array.isArray(err)) {
          err.map(e => {
            this.logger.error(this._options.name, e);
          });
        } else {
          this.logger.error(this._options.name, err);
        }
        break;
      case 'string':
        this.logger.error(this._options.name, err);
        break;
    }
  }
  
}

module.exports = ApiController;


