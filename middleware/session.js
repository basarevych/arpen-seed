/**
 * Session middleware
 * @module middleware/session
 */

/**
 * User session
 */
class Session {
    /**
     * Create the service
     * @param {object} config           Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'middleware.session'
     * @type {string}
     */
    static get provides() {
        return 'middleware.session';
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
        return Promise.resolve();
    }
}

module.exports = Session;