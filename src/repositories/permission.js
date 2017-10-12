/**
 * Permission repository
 * @module repositories/permission
 */
const path = require('path');
const BaseRepository = require('arpen/src/repositories/postgres');

/**
 * Permission repository class
 */
class PermissionRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     */
    constructor(app, postgres, cacher, util) {
        super(app, postgres, cacher, util);
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
     * DB table name
     * @type {string}
     */
    static get table() {
        return 'permissions';
    }

    /**
     * Model name
     * @type {string}
     */
    static get model() {
        return 'permission';
    }
}

module.exports = PermissionRepository;
