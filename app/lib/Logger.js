'use strict';

/**
 * Mirum-Logger wrapper
 *
 * Author: B.Williams <brent.williams@mirumagency.com>
 */

const settings = require('../config/settings');
//const Logger   = require('mirum-logger');

let config = settings.logging;

config.level = !!config.level ? config.level : 'error';

//module.exports = Logger.getLogger(config);

module.exports = {
    debug: () => {},
    error: () => {},
    info : () => {},
    trace: () => {},
    application: () => {}
}




