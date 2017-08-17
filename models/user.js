/**
 * User model
 * @module models/user
 */
const moment = require('moment-timezone');
const BaseModel = require('arpen/src/models/base');

/**
 * User model class
 */
class UserModel extends BaseModel {
    /**
     * Create model
     * @param {Postgres} postgres       Postgres service
     * @param {Util} util               Util service
     */
    constructor(postgres, util) {
        super(postgres, util);

        this.email = undefined;
        this.displayName = undefined;
        this.password = undefined;
        this.secret = undefined;
        this.createdAt = undefined;
        this.confirmedAt = undefined;
        this.blockedAt = undefined;
    }

    /**
     * Service name is 'models.user'
     * @type {string}
     */
    static get provides() {
        return 'models.user';
    }

    /**
     * Email setter
     * @type {undefined|string}
     */
    set email(email) {
        return this._setField('email', email);
    }

    /**
     * Email getter
     * @type {undefined|string}
     */
    get email() {
        return this._getField('email');
    }

    /**
     * Display name setter
     * @type {undefined|string|null}
     */
    set displayName(name) {
        return this._setField('display_name', name);
    }

    /**
     * Display name getter
     * @type {undefined|string|null}
     */
    get displayName() {
        return this._getField('display_name');
    }

    /**
     * Password setter
     * @type {undefined|string|null}
     */
    set password(password) {
        return this._setField('password', password);
    }

    /**
     * Password getter
     * @type {undefined|string|null}
     */
    get password() {
        return this._getField('password');
    }

    /**
     * Secret setter
     * @type {undefined|string}
     */
    set secret(secret) {
        return this._setField('secret', secret);
    }

    /**
     * Secret getter
     * @type {undefined|string}
     */
    get secret() {
        return this._getField('secret');
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

    /**
     * Confirmation time setter
     * @type {undefined|object|null}
     */
    set confirmedAt(confirmedAt) {
        return this._setField('confirmed_at', confirmedAt && moment(confirmedAt));
    }

    /**
     * Confirmation time getter
     * @type {undefined|object|null}
     */
    get confirmedAt() {
        return this._getField('confirmed_at');
    }

    /**
     * Block time setter
     * @type {undefined|object|null}
     */
    set blockedAt(blockedAt) {
        return this._setField('blocked_at', blockedAt && moment(blockedAt));
    }

    /**
     * Block time getter
     * @type {undefined|object|null}
     */
    get blockedAt() {
        return this._getField('blocked_at');
    }
}

module.exports = UserModel;
