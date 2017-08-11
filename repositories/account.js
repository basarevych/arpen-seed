/**
 * Account repository
 * @module repositories/account
 */
const path = require('path');
const BaseRepository = require('arpen/src/repositories/base');

/**
 * Account repository class
 */
class AccountRepository extends BaseRepository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     */
    constructor(app, postgres, cacher, util) {
        super(app, postgres, cacher, util);
        this._loadMethods(path.join(__dirname, 'account'));
    }

    /**
     * Service name is 'repositories.account'
     * @type {string}
     */
    static get provides() {
        return 'repositories.account';
    }

    /**
     * DB table name
     * @type {string}
     */
    static get table() {
        return 'accounts';
    }

    /**
     * Model name
     * @type {string}
     */
    static get model() {
        return 'account';
    }
}

module.exports = AccountRepository;
