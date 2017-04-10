/**
 * Error handling middleware
 * @module middleware/error
 */
const http = require('http');

/**
 * Error handler
 */
class ErrorHandler {
    /**
     * Create the service
     * @param {object} config           Configuration
     * @param {ErrorHelper} error       Error helper service
     * @param {Logger} logger           Logger service
     */
    constructor(config, error, logger) {
        this._config = config;
        this._error = error;
        this._logger = logger;
    }

    /**
     * Service name is 'middleware.errorHandler'
     * @type {string}
     */
    static get provides() {
        return 'middleware.errorHandler';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config', 'error', 'logger' ];
    }

    /**
     * Register middleware
     * @param {Express} server          The server
     * @return {Promise}
     */
    register(server) {
        server.express.use((req, res, next) => {
            next(this._error.newNotFound());
        });
        server.express.use((err, req, res, next) => {
            let info = this._error.info(err);
            let status = (info && info.httpStatus) || 500;

            if (status === 500)
                this._logger.error(err);

            if (res.headersSent)
                return;

            res.locals.statusCode = status;
            res.locals.statusPhrase = http.STATUS_CODES[status];
            res.locals.data = null;
            res.locals.errors = [];
            if (this._config.get('env') === 'development' && status === 500) {
                res.locals.data = JSON.stringify(info, undefined, 4);
                res.locals.errors = this._error.flatten(err);
            }

            res.status(status);
            res.render('error');
        });

        return Promise.resolve();
    }
}

module.exports = ErrorHandler;