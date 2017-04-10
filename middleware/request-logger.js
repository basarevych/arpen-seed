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
     */
    constructor(app, config, logStreams) {
        this._app = app;
        this._config = config;
        this._logStreams = logStreams;
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
        return [ 'app', 'config', 'logger.streamContainer' ];
    }

    /**
     * Register middleware
     * @param {Express} server          The server
     * @return {Promise}
     */
    register(server) {
        server.express.use(morgan('dev'));
        server.express.use(morgan('combined', { stream: this._logStreams.logs.get('access').stream }));

        return Promise.resolve();
    }
}

module.exports = RequestLogger;