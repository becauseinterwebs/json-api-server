'use strict';

const moment = require('moment');

class SerializerConfig {
  
  constructor(model) {
    
    let config = {
      id : 'id',
      whitelist : Object.keys(model.rawAttributes),
      links : {
        self: data => {
          return `/${model.tableName.toLowerCase()}/${data.id}`;
        }
      },
      topLevelMeta: (data, extraData) => {
        return {
          count: extraData.count,
          total: !!data ? data.length : 0,
          timestamp : moment()
        };
      },
      topLevelLinks: {
        // An object or a function that describes top level links.
        self: `/${model.tableName.toLowerCase()}`
      }
    };
    // create relationships if the model has associations defined
    if (!!model.associations) {
      config.relationships = {};
      Object.keys(model.associations).forEach(key => {
        config.relationships[key] = {
          type: key,
          links: data => {
            return {
              related: `/${model.tableName.toLowerCase()}/${data.id}/relationships/${key}`
            };
          }
        };
      });
    }
    
    this._config = config;
    
  }
  
  get config() {
    return this._config;
  }
  
}

module.exports = SerializerConfig;

