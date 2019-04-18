/**
 * Environment-specific settings template.  Edit and drop the .dist extension.
 * Settings defined here will either overwrite entries in the settings.js file
 * (if the entry keys match) or added to the settings object.
 *
 * Just the entries that need to be overwritten for normal operation are
 * provided.
 *
 * Please see the README.md file and /config/settings.js for explanations
 * and usage examples of these settings.
 */

module.exports = {
  app: {
    https   : false,
    url     : 'http://localhost:4000'
  },
  database   : {
    dialect  : 'sqlite',
    database : 'app/db/max.db',
    storage  : 'app/db/max.db'
  },
  services : { 
    Auth: {
      uri : 'http://dev-auth.marines.com'
    }
  }
};


