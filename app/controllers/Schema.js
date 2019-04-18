/**
 * This controller allows client to get a list of resources used by this service.
 * This is typically cached by the client so that they can serialize/deserialize 
 * responses from this service by creating serializers based on the attributes 
 * returned by this controller.  See the README for more information.
 */
'use strict';

const Db              = require('../lib/Db');
const Response        = require('../lib/Response');
const ApiController   = require('../lib/ApiController');
const Logger          = require('../lib/Logger');

class Controller extends ApiController {
  
  constructor(router) {
    super({
      name   : 'Schema',
      router : router
    });
  }
  
  get routes() {
    return {
      public: {
        '/'       : 'index',
        ':model'  : 'model'
      }
    };
  }
  
  /**
   * Return a list of database tables and their attributes and relationships
   * @param {type} req
   * @param {type} res
   * @returns {unresolved}
   */
  index(req, res) {
    let results = {};
    Object.keys(Db.models).map(model => {
      try {
        results[model] = { attributes : Object.keys(Db.models[model].rawAttributes) };
        if (!!Db.models[model].associations) {
          results[model].associations = Object.keys(Db.models[model].associations);
        }
      } catch (err) {
        // handle error
        this.error(err.message, res);
        return Response.error(err);
      }
    });
    return Response.ok(res, results);
  }
  
  /**
   * Return attributes and relationships for a specific resource object (table)
   * @param {type} req
   * @param {type} res
   * @returns {unresolved}
   */
  model(req, res) {
    let model = req.params.model;
    if (Db.models.hasOwnProperty(model)) {
      let result = {
        attributes : Object.keys(Db.models[model].rawAttributes)
      };
      if (!!Db.models[model].associations) {
        result.associations = Object.keys(Db.models[model].associations);
      }
      return Response.ok(res, result);
    } else {
      return Response.throw404(res);
    }
  }
}

module.exports = Controller;

