/**
 * HTTP request logging middleware
 * @module middleware/request-logger
 */
const morgan = require('morgan');
const RotatingFileStream = require('rotating-file-stream');

/**
 * Request logger
 */
class RequestLogger {
    /**
     * Create the service
     * @param {App} app                 Application
     * @param {object} config           Configuration
     * @param {object} express          Express app
     */
    constructor(app, config, express) {
        this._app = app;
        this._config = config;
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
        return [ 'app', 'config', 'express' ];
    }

    /**
     * Register middleware
     * @param {string} name                         Server name
     * @return {Promise}
     */
    register(name) {
        this._express.use(morgan('dev'));

        let logStream = RotatingFileStream(name + '-access.log', this._config.get(`servers.${name}.access_log`));
        this._express.use(morgan('combined', { stream: logStream }));

        return Promise.resolve();
    }
}

module.exports = RequestLogger;