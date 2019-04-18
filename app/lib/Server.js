/**
 * Base server instance using Express
 */
'use strict';

const express             = require('express');
const bodyParser          = require('body-parser');
const path                = require('path');
const fs                  = require('fs');
const basename            = path.basename(module.filename);

const logger              = require('./Logger');
const settings            = require('../config/settings');
const Response            = require('./Response');
const Resources           = require('../resources');
const ResourceController  = require('./ResourceController');

let app = express();


// Automatically log all HTTP calls
//app.use(logger.express);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let router = express.Router();

// This function will be used FIRST for ALL routes
router.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', settings.security.allow.origin);
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', settings.security.allow.methods.join(','));
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', settings.security.allow.headers.join(','));

  // inject the request and response object into the logging object for audit logging
  logger.req = req;
  logger.res = res;
  
  // make sure POST has data
  if (req.method.toUpperCase() === 'POST') {
    if (!req.body.data) {
      req.body.data = {};
      Object.keys(req.body).map(key => {
        req.body.data[key] = req.body[key];
        delete req.body[key];
      });
    }
  }
  
  next();
  
});

// Load controllers and add their routes...these are either 
// controllers that extend the ResourceController or ApiController class.
let controller_path = path.join(__dirname, '..', 'controllers');
let controllers = {};

fs
  .readdirSync(controller_path)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js'))
  .forEach(file => {
    // use the name of the model file as the key
    let name = file.slice(0, -3);
    let f = require(path.join(controller_path, file));
    try {
      let g = new f(router);
      controllers[name] = g;
    } catch (err) {
      console.log('Error loading controller', name, err.message);
    }
  });
  
// Now create resource controllers for any loaded resources that 
// do not already have a controller file specified in the controllers folder.
Object.keys(Resources).map(key => {
  if (!controllers[key]) {
    let g = new ResourceController({ name : key, router : router });
    controllers[key] = g;
  }
});

app.use(router);

// Global 404
app.use(function (req, res, next) {
  Response.throw404(res, `The requested path '${req.originalUrl}' could not be found.`);
  // Alternatively, redirect to home...
  //res.redirect('/');
});

module.exports = app;

       