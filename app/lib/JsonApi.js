/**
 * Wrapper for JSON-Api query and filter library
 */
'use strict';

const SequelizeJsonApiQuery = require('sequelize-jsonapi-query');
const Db                    = require('./Db');

class JsonApi extends SequelizeJsonApiQuery {
  constructor() {
    super({ resources : Db.models });
  }
}

module.exports = JsonApi;