'use strict';

const ApiController = require('./ApiController');
const Authenticate  = require('./Authenticate');
const Resources     = require('../resources');
const merge         = require('merge');

const default_routes = {
  authenticate: {
    '/'                           : 'index',
    ':id'                         : 'read',
    'POST /'                      : 'create',
    'PATCH /'                     : 'update',
    'PATCH :id'                   : 'update',
    'DELETE /'                    : 'remove',
    'DELETE :id'                  : 'remove',
    ':id/relationships/:resource' : 'related'
  },
  public: {
  }
};

class ResourceController extends ApiController {
  
  constructor(options) {
    
    super(options);
    
    this._resource = !!options.resource 
                        ? Resources[options.resource] 
                        : (!!Resources[options.name]
                            ? Resources[options.name]
                            : null);
  }
  
  get routes() {
    return merge.recursive(true, default_routes, this._routes);
  }
  
  get resource() {
    return this._resource;
  }
  
  index(req, res) {
    this.resource.search(req, res);
  }
  
  read(req, res) {
    this.resource.read(req, res);
  }
  
  create(req, res) {
    this.resource.create(req, res);
  }
  
  update(req, res) {
    this.resource.update(req, res);
  }
  
  remove(req, res) {
    this.resource.remove(req, res);
  }
  
  related(req, res) {
    this.resource.related(req, res);
  }
  
}

module.exports = ResourceController;


