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
     */
    constructor(app, config) {
        this._app = app;
        this._config = config;
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
        return [ 'app', 'config' ];
    }

    /**
     * Bootstrap the module
     * @return {Promise}
     */
    bootstrap() {
        return this._app.get('invalidateCache').register();
    }

    /**
     * Register routes with the server
     * @return {Array}
     */
    routers() {
        return [
            this._app.get('modules.index.routes.index').router,
            this._app.get('modules.index.routes.login').router,
            this._app.get('modules.index.routes.account.profile').router,
        ];
    }
}

module.exports = Index;
