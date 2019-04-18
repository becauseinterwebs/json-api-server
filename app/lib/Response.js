const moment = require('moment');

class Response {
  
    constructor() {
      // for errors
      this.errorCodes = 
        {
          '401' : 'Unauthorized',
          '403' : 'Forbidden',
          '404' : 'Not found',
          '500' : 'Error'
        };
    }

    timestamp() {
      return moment().utc().format('YYYY-MM-DDThh:mm:ssZ');
    }
    
    success(res, code, data) {
      code = !!code ? code : 200;
      let result = {};
      if (!!data) {
        if (data.hasOwnProperty('data')) {
          result.data = data.data;
        } else {
          result.data = data;
        }
      } else {
        result.data = "OK";
      }
      result.meta = {
        timestamp : this.timestamp()
      };
      res.status(code).json(result);
    }
    
    ok(res, data) {
      return this.success(res, 200, data);
    }
    
    created(res, data) {
      return this.success(res, 201, data);
    }
    
    accepted(res, data) {
      return this.success(res, 202, data);
    }
    
    throw(res, message, code, errors) {
      // make sure there is a code
      code = !!code ? code : 500;
      // default status title
      let status = 'Error';
      try {
        // return status title
        status = (!!this.errorCodes[code.toString()] ? this.errorCodes[code.toString()] : 'Error');
      } catch (err) {
        // if invalid code passed, use generic
        code = 500;
        status = 'Error';
      }
      let result =
        {
          errors: (!!errors ? errors : [])
        };
      let detail = 'Error';
      if (typeof message === 'object') {
        // only show all error details
        // in non-prod environments
        // (Security requirement)
        if (process.env.NODE_ENV === 'production') {
            detail = status;
        } else {
          if (message.message) {
            detail = message;
          }
        }
      } else {
        detail = message;
      }
      result.errors.push({
        status : code,
        title  : status,
        detail : detail
      });
      result.meta = {
        timestamp : this.timestamp()
      };
      return res.status(code).json(result);
    }

    // shortcut methods
    throw401(res, message, errors) {
      return this.throw(res, message, 401, errors);
    }

    throw403(res, message, errors) {
      return this.throw(res, message, 403, errors);
    }

    throw404(res, message, errors) {
      return this.throw(res, message, 404, errors);
    }

    throw500(res, message, errors) {
      return this.throw(res, message, 500, errors);
    }
    
    error(res, message, errors) {
      return this.throw(res, message, 500, errors);
    }

}

module.exports = new Response();

