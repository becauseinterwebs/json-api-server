/**
 * Base resource object (i.e. database table) that create a router and controller 
 * to allow for basic CRUD operations for a resource, including JSON-Api formatted 
 * requests (queries, filters, includes, etc.)
 * 
 * TODO: Add validators
 */
'use strict';

const JSONAPISerializer = require('json-api-serializer');
const path              = require('path');
const JsonApi           = require('./JsonApi');
const logger            = require('./Logger');
const Db                = require('./Db');
const SerializerConfig  = require('./SerializerConfig');
const Response          = require('./Response');

let Serializer = new JSONAPISerializer();

class Resource {
  
  constructor(options) {
    
    if (typeof options === 'string') {
      let name = options;
      options = {
        name       : name,
        model      : name,
        serializer : name
      };
    }
    
    if (!options.name) {
      throw new Error('Resource must have a name attribute');
      return;
    }
    
    this._name       = options.name;
    this._service    = options.service || null;
    this._model      = !!options.model ? Db.models[options.model] : null;
    
    this._serializer = null;
    
    this._attributes = null;
    
    if (!!options.serializer) {
      this._attributes = !!options.attributes 
                          ? options.attributes
                          : (!!options.model
                              ? Object.keys(Db.models[options.model].rawAttributes)
                              : null);
      if (!!this._attributes) {
        let config = new SerializerConfig(this._model);
        Serializer.register(this._name, config.config);
        this.serialize = (data) => {
          return Serializer.serializeAsync(options.name, data);
        };
        this.deserialize = (data) => {
          return Serializer.deserializeAsync(options.name, data);
        };
      }
                              
    }
    
  }
  
  // Perform search functions : GET /path/to/resource
  search(req, res) {
    let options = this.query(req);
    let that = this;
    return this.model
      .findAll(options)
      .then(results => {
        if (!req.query.deserialize || req.query.deserialize.trim().toLowerCase() !== 'true') {
          that.serialize(results)
            .then(results => { 
              res.status(200).json(results);
            })
            .catch(err => {
              Response.error(res, err.message);   
            });
        } else {
          Response.ok(results);
        }
      })
      .catch(err => {
        Response.error(res, err.message);
      });
  }
  
  read(req, res) {
    let options = this.query(req);
    options.where = { id : req.params.id };
    let that = this;
    return this.model
      .findOne(options)
      .then(results => {
        if (!req.query.deserialize || req.query.deserialize.trim().toLowerCase() !== 'true') {
          that.serialize(results)
            .then(results => { 
              res.status(200).json(results);
            })
            .catch(err => {
              Response.error(res, err.message);   
            });
        } else {
          Response.ok(results);
        }
      })
      .catch(err => {
        Response.error(res, err.message);
      });
  }
  
  /* CREATE a new resource
   * 
   * @param {type} req
   * @param {type} res
   * @returns {unresolved}
   * 
   * This method should allow for:
   *  1. Creating (new) associated resources along with the primary resource
   *     by providing the minimum required fields for that resource
   *  2. Associating existing related resources by passing their id.  In this 
   *     case the type of relationship (one-to-one or one-to-many) will need to 
   *     be known so that the association can be created correctly.
   */
  create(req, res) {
    let data = req.body.data;
    if (!data || Object.keys(data).length < 1 || !data.attributes || Object.keys(data.attributes).length < 1) {
      return Response.error(res, 'No data');
    }
    /*
     if (!!this.validator) {
        // validate 
     }
     */
    let that = this;
    // Fields for main resource
    let payload = data.attributes;
    let options = {
      include : []
    };
    // Create new related resources or create associations 
    // for existing related resources
    if (!!data.relationships) {
      Object.keys(data.relationships).forEach(key => {
        let related = data.relationships[key];
        if (!!related.data) {
          let relationship;
          if (Array.isArray(related.data)) {
            relationship = [];
            related.data.forEach(item => {
              if (!!item.attributes) {
                relationship.push(item.attributes);
              }
            });
          } else if (!!related.data.id) {
            // associate existing resource
          } else if (!!related.data.attributes) {
            // create new single relationship
            relationship = related.data.attributes;
          } else {
            // ? Throw error?  Ignore?
          }
          if (!!relationship) {
            payload[key] = relationship;
            options.include.push(key);
          }
        }
      });
    }
    this.model
      .create(payload, options)
      .then(created => {
        return created;
      }).then(created => {
        return that.serialize(created);
      })
      .then(results => {
        Response.created(res, results);
      })
      .catch(err => {
        Response.error(res, err.message);
      });
  }
  
  /*
   * Update an existing resource, throw 404 if not found
   * @param {type} req
   * @param {type} res
   * @returns {unresolved}
   */
  update(req, res) {
    let data = req.body.data;
    if (!data || Object.keys(data).length < 1 || !data.attributes || Object.keys(data.attributes).length < 1) {
      return Response.error('No data');
    }
    /*
     if (!!this.validator) {
        // validate 
     }
     */
    let that = this;
    // Fields for main resource
    let payload = data.attributes;
    let id = !!data.id ? data.id : (!!req.params.id ? req.params.id : null);
    if (!id) {
      return Response.throw404(res, 'Resource not found');
    }
    let options = {
      where : {
        id : id
      }
    };
    this.model
      .findOne(options)
      .then(result => {
        if (!result) {
          throw new Error('Not found');
        } else {
          return this.model.update(payload,options);
        }
      }).then(updated => {
        return this.model.findOne(options);
      })
      .then(results => {
        if (!req.query.deserialize || req.query.deserialize.trim().toLowerCase() !== 'true') {
          that.serialize(results)
            .then(results => { 
              res.status(200).json(results);
            })
            .catch(err => {
              Response.error(res, err.message);   
            });
        } else {
          Response.ok(results);
        }
      })
      .catch(err => {
        let code = (err.message === 'Not found' ? 404 : 500);
        Response.throw[`throw${code}`](res, err.message);
      });
  }

  /**
   * Remove an existing resource, throw 404 if not found
   * @param {type} req
   * @param {type} res
   * @returns {unresolved}
   */
  remove(req, res) {
    let data = req.body.data || {};
    let id = !!data.id ? data.id : (!!req.params.id ? req.params.id : null);
    if (!id) {
      return Response.throw404(res, 'Not found');
    }
    let options = {
      where : {
        id : id
      }
    };
    let that = this;
    this.model
      .findOne(options)
      .then(result => {
        if (!result) {
          throw new Error('Not found');
        } else {
          return that.destroy(options);
        }
      })
      .then(() => {
        Response.ok(res, { id : id });
      })
      .catch(err => {
        let code = (err.message === 'Not found' ? 404 : 500);
        Response.throw[`throw${code}`](res, err.message);
      });
  }
  
  related(req, res) {
    let options = this.query(req);
    options.where = { id : req.params.id };
    let resource = req.params.resource;
    if (!options.include) {
      options.include = [];
    }
    options.include.push({
      association : resource,
      required : false
    });
    let that = this;
    return this.model
      .findOne(options)
      .then(result => {
        return that.serialize(result);
      })
      .then(result => {
        Response.ok(res, result);
      })
      .catch(err => {
        Response.error(res, err.message);
      });
  }
  
  get name() {
    return this._name;
  }
  
  get model() {
    return this._model;
  }
  
  get service() {
    return this._service;
  }
  
  get serializer() {
    return this._serializer;
  }
  
  get attributes() {
    return this._attributes;
  }
  
  query(req) {
    return new JsonApi().parse(req, this.name);
  }
  
}

module.exports = Resource;

