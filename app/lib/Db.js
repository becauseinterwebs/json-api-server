/**
 * This is the main database object.  It will automatically create controllers 
 * and add routers for any models defined in the ../models folder.
 */
'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');

const settings  = require('../config/settings');
const logger    = require('./Logger');
const basename  = path.basename(module.filename);

const modelpath = '../models';

const db = {
  models : {}
};

function log(msg) {
  logger.trace(msg);
  console.log(msg);
}

function databaseValid() {
    let valid = false;
    if (!settings.database 
        || Object.keys(settings.database).length < 2 
        || !settings.database.dialect 
        || settings.database.dialect.trim() === '') {
        return;
    }
    switch (settings.database.dialect.toLowerCase()) {
        case 'sqlite':
            valid = (!!settings.database.storage && settings.database.storage.trim() !== '');
            break;
        case 'mysql':
            valid = (!!settings.database.host && settings.database.host.trim() !== '') &&
                    (!!settings.database.name && settings.database.name.trim() !== '') &&
                    (!!settings.database.user && settings.database.user.trim() !== '');
            break;
    }
    return valid;    
}

if (databaseValid() === true) { 
  // database options
  let options = {
    logging: log,
    dialect: settings.database.dialect,
    operatorsAliases: false,
    dialectOptions: {
      multipleStatements: true
    },
    pool: {
      max: settings.database.pool || 100,
      min: 0,
      idle: settings.database.idle || 10000
    }
  };

  switch (settings.database.dialect.toLowerCase()) {
    case 'sqlite':
        options.storage = settings.database.storage;
        settings.database.name = settings.database.storage;
        break;
    case 'mysql':
        options.host = settings.database.host;
        break;
  }
  let sequelize;
console.log(options);
  // create connection
  try {
    sequelize = new Sequelize(
      settings.database.name,
      settings.database.user,
      settings.database.password,
      options
    );
  } catch (err) {
    console.log('COULD NOT CONNECT TO DATABASE', err);
    process.exit(1);
  }

  // Load all models in the models folder
  fs
    .readdirSync(path.join(__dirname, modelpath))
    .filter(file =>
      (file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js')) 
    .forEach(file => {
      // use the name of the model file as the key
      let name = file.slice(0, -3);
      const model = sequelize.import(path.join(__dirname, modelpath, file));
      db.models[name] = model;
    });

  // Execute any defined associations
  Object.keys(db.models).forEach(model => {
    try {
      if (!!db.models[model].associate && typeof db.models[model].associate === 'function') {
        db.models[model].associate(db.models);
      }
    } catch (err) {
      console.log(`ERROR creating associations for ${model}: ${err.message}`);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  db.Op = Sequelize.Op;

  // Automatically create/update tables, keys, associations, etc.
  if (settings.database.sync === true) {
    db.sequelize.sync({ alter : true })
      .then(() => {
      })
      .catch(err => {
        console.log('Error syncing db', err.message);
      });
  }    
}
  
module.exports = db;
