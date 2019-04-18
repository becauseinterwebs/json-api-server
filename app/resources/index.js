'use strict';

const fs                = require('fs');
const path              = require('path');
const Resource          = require('../lib/Resource');

const basename = path.basename(module.filename);

const modules = {};

// Load all modules in this folder first
// TODO: Actually implement a resource entity ;)
fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    let module = require(path.join(__dirname, file));
    modules[module.name] = new module();
  });
  
// Load all modules in the models folder 
fs
  .readdirSync(path.join(__dirname, '../models'))
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    
    // use the name of the module file as the key
    let name = file.slice(0, -3);
    try {
      if (!modules[name]) {
        modules[name] = new Resource(name);
      }
    } catch (err) {
      console.log('Could not create resource for model', name);
    }
    
  });

  module.exports = modules;