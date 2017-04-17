/**
 * User model
 * @module models/user
 */
const Model = require('./base');

/**
 * User model class
 */
class UserModel extends Model {
    /**
     * Create model
     */
    constructor() {
        super();

        this.id = undefined;
        this.email = undefined;
        this.displayName = undefined;
        this.password = undefined;
        this.createdAt = undefined;
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
     * ID setter
     * @type {undefined|number}
     */
    set id(id) {
        this._setField('id', id);
    }

    /**
     * ID getter
     * @type {undefined|number}
     */
    get id() {
        return this._getField('id');
    }

    /**
     * Email setter
     * @type {undefined|string}
     */
    set email(email) {
        this._setField('email', email);
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
        this._setField('display_name', name);
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
        this._setField('password', password);
    }

    /**
     * Password getter
     * @type {undefined|string|null}
     */
    get password() {
        return this._getField('password');
    }

    /**
     * Creation time setter
     * @type {undefined|object}
     */
    set createdAt(createdAt) {
        this._setField('created_at', createdAt);
    }

    /**
     * Creation time getter
     * @type {undefined|object}
     */
    get createdAt() {
        return this._getField('created_at');
    }

    /**
     * Block time setter
     * @type {undefined|object|null}
     */
    set blockedAt(blockedAt) {
        this._setField('blocked_at', blockedAt);
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
