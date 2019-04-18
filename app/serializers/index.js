'use strict';

const fs        = require('fs');
const path      = require('path');
const Db        = require('../lib/Db');
const moment    = require('moment');

const basename  = path.basename(module.filename);

const JSONAPISerializer = require("json-api-serializer");

let Serializer = new JSONAPISerializer();
  
// Keeps track of what has been registered
let modules = [];

// Load all files in this folder
fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    // use the name of the model file as the key
    let name = file.slice(0, -3);
    let attributes = [];
    if (Db.hasOwnProperty(name)) {
      attributes = Object.keys(Db.models[name].rawAttributes);
    }
    let config = require('./' + name)(attributes);
    Serializer.register(name, config);
    modules.push(name);
  });
      
module.exports = Serializer;