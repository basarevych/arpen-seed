/**
 * Static files middleware
 * @module middleware/static-files
 */
const path = require('path');
const express = require('express');

/**
 * Module-provided static files
 */
class StaticFiles {
    /**
     * Create the service
     * @param {object} config           Configuration
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Service name is 'middleware.staticFiles'
     * @type {string}
     */
    static get provides() {
        return 'middleware.staticFiles';
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
                let filename = dir[0] === '/' ?
                    dir :
                    path.join(this._config.base_path, 'modules', _module.name, dir);
                server.express.use(express.static(filename));
            }
        }
        return Promise.resolve();
    }
}

module.exports = StaticFiles;