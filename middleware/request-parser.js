/**
 * HTTP request parsing middleware
 * @module middleware/request-parser
 */
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

/**
 * Request parser
 */
class RequestParser {
    /**
     * Create the service
     * @param {object} config           Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'middleware.requestParser'
     * @type {string}
     */
    static get provides() {
        return 'middleware.requestParser';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'config' ];
    }

    /**
     * Register middleware
     * @param {Express} server          The server
     * @return {Promise}
     */
    register(server) {
        server.express.use(bodyParser.json({
            limit: this._config.get(`servers.${server.name}.options.body_limit`),
        }));
        server.express.use(bodyParser.urlencoded({
            limit: this._config.get(`servers.${server.name}.options.body_limit`),
            extended: false,
        }));

        server.express.use(cookieParser());

        return Promise.resolve();
    }
}

module.exports = RequestParser;