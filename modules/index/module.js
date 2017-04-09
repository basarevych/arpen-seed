/**
 * Index module
 * @module index/module
 */


/**
 * Module main class
 */
class Index {
    /**
     * Create the module
     * @param {App} app                             The application
     * @param {object} config                       Configuration
     * @param {InvalidateCache} invalidateCache     InvalidateCache service
     */
    constructor(app, config, invalidateCache) {
        this.routers = [];

        this._app = app;
        this._config = config;
        this._invalidateCache = invalidateCache;
    }

    /**
     * Service name is 'modules.index'
     * @type {string}
     */
    static get provides() {
        return 'modules.index';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'invalidateCache' ];
    }

    /**
     * Bootstrap the module
     * @return {Promise}
     */
    bootstrap() {
        return this._invalidateCache.register();
    }

    /**
     * Register with the server
     * @param {string} name                     Server name as in config
     * @return {Promise}
     */
    register(name) {
        if (this._config.get(`servers.${name}.class`) === 'servers.express') {
            this.routers.push(this._app.get('modules.index.routes.index').router);
        }

        return Promise.resolve();
    }
}

module.exports = Index;
