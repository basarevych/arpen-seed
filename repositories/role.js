/**
 * Role repository
 * @module repositories/role
 */
const path = require('path');
const BaseRepository = require('arpen/src/repositories/base');

/**
 * Role repository class
 */
class RoleRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     */
    constructor(app, postgres, cacher, util) {
        super(app, postgres, cacher, util);
        this._loadMethods(path.join(__dirname, 'role'));
    }

    /**
     * Service name is 'repositories.role'
     * @type {string}
     */
    static get provides() {
        return 'repositories.role';
    }

    /**
     * DB table name
     * @type {string}
     */
    static get table() {
        return 'roles';
    }

    /**
     * Model name
     * @type {string}
     */
    static get model() {
        return 'role';
    }
}

module.exports = RoleRepository;
