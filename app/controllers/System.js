/**
 * System utilities
 */

const ApiController = require('../lib/ApiController');
const Response      = require('../lib/Response');
const logger        = require('../lib/Logger');

class Controller extends ApiController {
  
  constructor(router) {
    super({
      name  : 'System',
      router: router
    });
  }
  
  get routes() {
    return {
      public: {
        'heartbeat' : 'heartbeat'
      }
    };
  }
  
  /**
   * Provide a heartbeat endpoint so that service operation can be monitored
   * @param {type} req
   * @param {type} res
   * @returns {undefined}
   */
  heartbeat(req, res) {
    Response.ok(res);
  }
  
};

module.exports = Controller;