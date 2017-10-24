/**
 * Index module
 * @module web/module
 */

/**
 * Module main class
 */
class WebModule {
    /**
     * Create the module
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
     */
    constructor(app, config) {
        this._app = app;
        this._config = config;
    }

    /**
     * Service name is 'modules.web'
     * @type {string}
     */
    static get provides() {
        return 'modules.web';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [
            'app',
            'config',
        ];
    }

    /**
     * Bootstrap the module
     * @return {Promise}
     */
    async bootstrap() {
        this.routes = this._app.get(/^web\.routes\..+$/);
    }

    /**
     * Get module routers
     * @return {object[]}
     */
    routers() {
        return Array.from(this.routes.values()).map(route => {
            return { priority: route.priority, router: route.router };
        });
    }
}

module.exports = WebModule;
