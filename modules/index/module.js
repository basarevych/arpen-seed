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
     * @param {App} app             The application
     * @param {object} config       Configuration
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
        return Promise.resolve();
    }

    /**
     * Register with the server
     * @param {string} name                     Server name as in config
     * @return {Promise}
     */
    register(name) {
        if (this._config.get(`servers.${name}.class`) != 'servers.express')
            return Promise.resolve();

        let express = this._app.get('express');
        express.use('/', this._app.get('modules.index.routes.index').router);
        return Promise.resolve();
    }
}

module.exports = Index;
