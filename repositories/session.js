/**
 * Session repository
 * @module repositories/session
 */
const path = require('path');
const BaseRepository = require('./base');

/**
 * Session repository class
 */
class SessionRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {object} config                       Configuration service
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     */
    constructor(app, config, postgres, cacher, util) {
        super(app, postgres, util);
        this._config = config;
        this._cacher = cacher;

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
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'postgres', 'cacher', 'util' ];
    }
}

module.exports = SessionRepository;
