/**
 * An example Caching object that can be used to pre-load data or objects 
 * that will be needed by your application that may not change (or not change
 * very often) to save some round-trips when needed...
 */
'use strict';

const settings          = require('../config/settings');
// If needed...
//const Services          = require('../services');
//const logger            = require('./Logger');

class Cache {
  
  constructor() {
    // configure the different object stores here
    // We'll create a user store for example
    this._users = {};
  }
  
  addUser(data) {
    if (!data) {
      return false;
    }
    // You can configure cache settings in your env.js file, for example: 
    // {
    //    cache: { 
    //       users : {
    //         ttl : 0 // in seconds, minutes, whatever
    //       }
    //    }
    // }
    // In this example, only add to cache if the ttl is greater than 0
    if (!!settings.cache && !!settings.cache.users && settings.cache.users.ttl > 0) {
      // You can either add the time it was cached or the time it should expire
      // for validation later.
      data._expiresAt = new Date().getTime() + (settings.cache.users.ttl * 60 * 1000);
      //logger.debug('Cache.addUser', user);
      this._users[data.username] = data;
      return true;
    } else {
      return false;
    }
  }
    
  removeUser(username) {
    if (this._users[username]) {
      delete this._users[username];
    }
    return true;
  }
  
  getUser(username) {
    //logger.debug('Cache.getUser', username);
    // Only perform a lookup if the cache setting is enabled and the TTL
    // is greater than 0
    if (!!settings.cache && !!settings.cache.users && settings.cache.users.ttl > 0) {
      if (this._users.hasOwnProperty(username)) {
        // Check the TTL
        let ts = new Date().getTime();
        if ( ts <= this._users[username].expiresAt ) {
            //logger.debug('Cache.getUser', 'return existing');
            return this._users[username];
        } else {
            //logger.debug('Cache.getUser', 'TTL expired', username);
        }
      }
    }
    // If we are here, the user was not found
    //logger.debug('Cache.getUser', 'User ' + username + ' not found');
    return null;
  }
  
  clearUserCache() {
      this._users = {};
  }
  
  warmup() {
    // Can be called from the main index.js or another file to pre-load any 
    // needed data
  }
  
  get users() {
    return this._users;
  }
  
}

module.exports = new Cache();

