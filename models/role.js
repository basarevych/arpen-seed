/**
 * Role model
 * @module models/role
 */
const Model = require('./base');

/**
 * Role model class
 */
class RoleModel extends Model {
    /**
     * Create model
     */
    constructor() {
        super();

        this.id = undefined;
        this.parentId = undefined;
        this.title = undefined;
    }

    /**
     * Service name is 'models.role'
     * @type {string}
     */
    static get provides() {
        return 'models.role';
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
     * Parent ID setter
     * @type {undefined|number|null}
     */
    set parentId(id) {
        this._setField('parent_id', id);
    }

    /**
     * Parent ID getter
     * @type {undefined|number|null}
     */
    get parentId() {
        return this._getField('parent_id');
    }

    /**
     * Title setter
     * @type {undefined|string}
     */
    set title(name) {
        this._setField('title', name);
    }

    /**
     * Title getter
     * @type {undefined|string}
     */
    get title() {
        return this._getField('title');
    }
}

module.exports = RoleModel;
