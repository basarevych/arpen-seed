/**
 * Account model
 * @module models/account
 */
const moment = require('moment-timezone');
const BaseModel = require('arpen/src/models/base');

/**
 * Account model class
 */
class AccountModel extends BaseModel {
    /**
     * Create model
     * @param {Postgres} postgres       Postgres service
     * @param {Util} util               Util service
     */
    constructor(postgres, util) {
        super(postgres, util);

        this.id = undefined;
        this.userId = undefined;
        this.source = undefined;
        this.identifier = undefined;
        this.createdAt = undefined;
    }

    /**
     * Service name is 'models.account'
     * @type {string}
     */
    static get provides() {
        return 'models.account';
    }

    /**
     * ID setter
     * @type {undefined|number}
     */
    set id(id) {
        return this._setField('id', id);
    }

    /**
     * ID getter
     * @type {undefined|number}
     */
    get id() {
        return this._getField('id');
    }

    /**
     * User ID setter
     * @type {undefined|number}
     */
    set userId(id) {
        return this._setField('user_id', id);
    }

    /**
     * User ID getter
     * @type {undefined|number}
     */
    get userId() {
        return this._getField('user_id');
    }

    /**
     * Source setter
     * @type {undefined|string}
     */
    set source(source) {
        return this._setField('source', source);
    }

    /**
     * Source getter
     * @type {undefined|string}
     */
    get source() {
        return this._getField('source');
    }

    /**
     * Identifier setter
     * @type {undefined|string}
     */
    set identifier(identifier) {
        return this._setField('identifier', identifier);
    }

    /**
     * Identifier getter
     * @type {undefined|string}
     */
    get identifier() {
        return this._getField('identifier');
    }

    /**
     * Creation time setter
     * @type {undefined|object}
     */
    set createdAt(createdAt) {
        return this._setField('created_at', createdAt && moment(createdAt));
    }

    /**
     * Creation time getter
     * @type {undefined|object}
     */
    get createdAt() {
        return this._getField('created_at');
    }
}

module.exports = AccountModel;
