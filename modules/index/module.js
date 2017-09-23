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
     * @param {App} app                                     The application
     * @param {object} config                               Configuration
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
        await this._app.get('invalidateCache').register();
        this.routes = this._app.get(/^modules\.index\.routes\..+$/);
        console.log(Array.from(this.routes.keys()));
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

module.exports = Index;
