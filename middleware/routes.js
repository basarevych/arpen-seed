/**
 * Module-defined routes middleware
 * @module middleware/routes
 */

/**
 * Module-provided routes
 */
class Routes {
    /**
     * Create the service
     * @param {Map} modules             Loaded application modules
     * @param {object} express          Express app
     */
    constructor(modules, express) {
        this._modules = modules;
        this._express = express;
    }

    /**
     * Service name is 'middleware.routes'
     * @type {string}
     */
    static get provides() {
        return 'middleware.routes';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'modules', 'express' ];
    }

    /**
     * Register middleware
     * @param {string} name                         Server name
     * @return {Promise}
     */
    register(name) {
        for (let [ moduleName, moduleInstance ] of this._modules) {
            if (!Array.isArray(moduleInstance.routers))
                continue;

            for (let router of moduleInstance.routers)
                this._express.use('/', router);
        }

        return Promise.resolve();
    }
}

module.exports = Routes;