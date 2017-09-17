/**
 * Session repository
 * @module repositories/session
 */
const path = require('path');
const BaseRepository = require('arpen/src/repositories/postgres');

/**
 * Session repository class
 */
class SessionRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     */
    constructor(app, postgres, cacher, util) {
        super(app, postgres, cacher, util);
        this._loadMethods(path.join(__dirname, 'session'));
    }

    /**
     * Service name is 'repositories.session'
     * @type {string}
     */
    static get provides() {
        return 'repositories.session';
    }

    /**
     * DB table name
     * @type {string}
     */
    static get table() {
        return 'sessions';
    }

    /**
     * Model name
     * @type {string}
     */
    static get model() {
        return 'session';
    }
}

module.exports = SessionRepository;
