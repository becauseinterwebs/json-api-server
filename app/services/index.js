/**
 * Reads any service files defined in this folder and returns a service object
 * that can be accessed as:
 * 
 * const services = require('../services');
 * 
 * services.service_name.method(payload)
 *   then(response => {
 *      // handle response
 *   })
 *   .catch(err => {
 *      // handle error
 *   })
 */
'use strict';

const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(module.filename);
const settings  = require('../config/settings');

const modules = {};

// Load all modules in this folder
fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    // use the name of the model file as the key
    let name = file.slice(0, -3);
    let f = require(path.join(__dirname, file));
    modules[name] = new f(settings.services[name]);
  });

  module.exports = modules;