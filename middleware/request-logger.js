/**
 * HTTP request logging middleware
 * @module middleware/request-logger
 */
const morgan = require('morgan');

/**
 * Request logger
 */
class RequestLogger {
    /**
     * Create the service
     * @param {App} app                 Application
     * @param {object} config           Configuration
     * @param {object} logStreams       Log streams
     * @param {object} express          Express app
     */
    constructor(app, config, logStreams, express) {
        this._app = app;
        this._config = config;
        this._logStreams = logStreams;
        this._express = express;
    }

    /**
     * Service name is 'middleware.requestLogger'
     * @type {string}
     */
    static get provides() {
        return 'middleware.requestLogger';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'logger.streamContainer', 'express' ];
    }

    /**
     * Register middleware
     * @param {string} name                         Server name
     * @return {Promise}
     */
    register(name) {
        this._express.use(morgan('dev'));
        this._express.use(morgan('combined', { stream: this._logStreams.logs.get('access').stream }));

        return Promise.resolve();
    }
}

module.exports = RequestLogger;