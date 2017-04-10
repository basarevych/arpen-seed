/**
 * Favicon middleware
 * @module middleware/favicon
 */
const fs = require('fs');
const path = require('path');
const favicon = require('serve-favicon');

/**
 * Favicon
 */
class Favicon {
    /**
     * Create the service
     * @param {object} config           Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'middleware.favicon'
     * @type {string}
     */
    static get provides() {
        return 'middleware.favicon';
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
        for (let _module of this._config.modules) {
            for (let dir of _module.static || []) {
                let filename = path.join(
                    dir[0] === '/' ?
                        dir :
                        path.join(this._config.base_path, 'modules', _module.name, dir),
                    'img',
                    'favicon.ico'
                );
                try {
                    if (fs.lstatSync(filename).isFile()) {
                        server.express.use(favicon(filename));
                        break;
                    }
                } catch (error) {
                    // do nothing
                }
            }
        }

        return Promise.resolve();
    }
}

module.exports = Favicon;