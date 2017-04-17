/**
 * Permission repository
 * @module repositories/permission
 */
const path = require('path');
const Repository = require('./base');

/**
 * Permission repository class
 */
class PermissionRepository extends Repository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {object} config                       Configuration service
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     * @param {PermissionModel} model               Permission model
     */
    constructor(app, config, postgres, cacher, util, model) {
        super(app, postgres, util, model);
        this._config = config;
        this._cacher = cacher;

        this._loadMethods(path.join(__dirname, 'permission'));
    }

    /**
     * Service name is 'repositories.permission'
     * @type {string}
     */
    static get provides() {
        return 'repositories.permission';
    }

    /**
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'postgres', 'cacher', 'util', 'models.permission' ];
    }
}

module.exports = PermissionRepository;
