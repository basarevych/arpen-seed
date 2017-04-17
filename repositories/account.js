/**
 * Account repository
 * @module repositories/account
 */
const path = require('path');
const Repository = require('./base');

/**
 * Account repository class
 */
class AccountRepository extends Repository {
    /**
     * Create repository
     * @param {App} app                             The application
     * @param {object} config                       Configuration service
     * @param {Postgres} postgres                   Postgres service
     * @param {Cacher} cacher                       Cacher service
     * @param {Util} util                           Util service
     * @param {AccountModel} model                  Account model
     */
    constructor(app, config, postgres, cacher, util, model) {
        super(app, postgres, util, model);
        this._config = config;
        this._cacher = cacher;

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
     * Dependencies as constructor arguments
     * @type {string[]}
     */
    static get requires() {
        return [ 'app', 'config', 'postgres', 'cacher', 'util', 'models.account' ];
    }
}

module.exports = AccountRepository;
