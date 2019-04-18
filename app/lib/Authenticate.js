/**
 * Authentication middleware
 */

'use strict';

const fs           = require('fs');

const settings     = require('../config/settings');
const Services     = require('../services');
const logger       = require('./Logger');
const Response     = require('./Response');

// Pre-load the public key that will be used to validate tokens.
// The key that is distributed with this codebase is the same one used 
// by the Auth service to create the key.
let public_key = fs.readFileSync(settings.security.public_key);
  
module.exports = (req, res, next) => {
  
  let token;

  let validateApp = () => {
    let app = settings.apps[token];
    let result = true;
    if (!!app.routes) {
      let routes = app.routes;
      let keys = Object.keys(routes);
      if (keys.length > 0) {
        let found = false;
        keys.map(key => {
          if (req.originalUrl.indexOf(key) === 0) {
            found = true;
            if (!!routes[key].methods && routes[key].methods.length > 0) {
              found = (routes[key].methods.indexOf(req.method.toUpperCase())) || 
                      (routes[key].methods.indexOf(req.method.toLowerCase()));
            }  
          }  
        });
      }
    }
    return result;
  };
  
  // Get token from Authorization header
  let header = req.get("Authorization");
  if (!!header && header !== '') {
    var parts = header.split(' ');
    if (parts.length > 1) {
      if (parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }
  }
  
  if (!!token) {
    
    // First check to see if this request is coming from another application
    if (settings.apps.hasOwnProperty(token)) {
        // Setup a system/application user
        //let user = new User();
        //user.setAppUser(settings.tokens[token]);
        //if (user.validatePath(req.originalUrl)) {
        if (validateApp() === true) {
          next();
        } else {
          return Response.throw401(res);
        }
    } else {  
      // Verify the token with the Auth service.
      // See the README.md file for an explanation on how services are 
      // configured.
      Services.Auth.verify({ token : token })
        .then(response => {
          if (!!response && !!response.data && response.data.toLowerCase() === 'ok') {
            if (!!response.errors) {
              throw new Error(response.errors[0].detail);
            } else {
              settings.token = token;
              // Get the user info...you can also cache this if you want to 
              // save a trip.
              return Services.Auth.info({ token : token });
            }
          } else {
            throw new Error('Invalid token');
          }
        })
        .then(response => {
          if (!!response.errors) {
            throw new Error('Invalid user');
          // Use the line below if authenticating based on an application symbol
          //} else if (!!response.data && response.data.isActive === true && response.data.MappedUsername.allowed === true) {
          } else if (!!response.data && response.data.isActive === true) {
            // Assign the user response to the request object so that it is available to other functions.
            // NOTE: You can also create a user class that has methods you need for your application here 
            // and assign it to the request object, add it to a cache, etc.
            req.User = response.data;
            next();
          } else {
            throw new Error('Invalid user');
          }
        })
        .catch(err => {
          return Response.throw401(res, err.message);
        });
    }
  } else {
    if (req.method === 'OPTIONS') {
      return res.status(200).send('ok');
    } else {
      return Response.throw401(res);
    }
  }
  
    
};

