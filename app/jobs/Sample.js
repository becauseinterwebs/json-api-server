/**
 * Sample job
 * 
 * Jobs are run with the command: npm run job JobName (must match filename w/o .js)
 */

'use strict';

const settings  = require('../config/settings');

class Job
{

  constructor(options) {
    // configure options here
    this.options = options || {};
  }
  
  // Run is required...
  run() {
    
    // Do stuff
    // ... 
    
    // Don't forget to exit
    process.exit(0);
    
  }
  
}

module.exports = Job;